import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import {
  canonicalSerialize,
  GuideShotError,
  hashCanonical,
  sha256,
  type CaptureResult,
  type CapturedScene,
  type OutputFormat,
} from '@guideshot/core';
import { imageSize } from 'image-size';

export interface CachedScene {
  readonly sceneHash: string;
  readonly scene: CapturedScene;
  readonly background: Uint8Array;
}

interface ScenePointer {
  readonly version: 1;
  readonly sceneHash: string;
}

export interface CachedComposition {
  readonly format: OutputFormat;
  readonly mimeType: 'image/png' | 'image/webp';
  readonly bytes: Uint8Array;
  readonly width: number;
  readonly height: number;
  readonly hash: string;
}

interface CompositionMetadata {
  readonly version: 1;
  readonly format: OutputFormat;
  readonly mimeType: 'image/png' | 'image/webp';
  readonly width: number;
  readonly height: number;
  readonly hash: string;
}

export class SceneCache {
  readonly #root: string;

  constructor(cacheDir: string) {
    this.#root = path.join(cacheDir, 'scenes');
  }

  async write(result: CaptureResult): Promise<CachedScene> {
    const scene = normalizeAndValidateScene(result.scene, result.background);
    const sceneHash = hashCanonical({
      scene,
      background: scene.background.sha256,
    });
    assertHash(scene.captureKey, 'capture key');
    assertHash(sceneHash, 'scene hash');

    const captureDir = path.join(this.#root, scene.captureKey);
    const snapshotDir = path.join(captureDir, sceneHash);
    await mkdir(captureDir, { recursive: true, mode: 0o700 });

    if (await exists(snapshotDir)) {
      await readSnapshot(snapshotDir, scene.captureKey, sceneHash);
    } else {
      const staging = await mkdtemp(path.join(captureDir, '.scene-'));
      try {
        await Promise.all([
          writeFile(path.join(staging, 'background.png'), result.background, {
            mode: 0o600,
          }),
          writeFile(
            path.join(staging, 'scene.json'),
            `${canonicalSerialize(scene)}\n`,
            { encoding: 'utf8', mode: 0o600 },
          ),
        ]);
        try {
          await rename(staging, snapshotDir);
        } catch (error) {
          if (!(await exists(snapshotDir))) throw error;
          await readSnapshot(snapshotDir, scene.captureKey, sceneHash);
        }
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
    }

    await writeAtomicJson(path.join(captureDir, 'current.json'), {
      version: 1,
      sceneHash,
    } satisfies ScenePointer);
    return { sceneHash, scene, background: Uint8Array.from(result.background) };
  }

  async read(captureKey: string): Promise<CachedScene> {
    assertHash(captureKey, 'capture key');
    const captureDir = path.join(this.#root, captureKey);
    let pointer: ScenePointer;
    try {
      pointer = parsePointer(
        await readFile(path.join(captureDir, 'current.json'), 'utf8'),
      );
    } catch (cause) {
      if (cause instanceof GuideShotError) throw cause;
      throw new GuideShotError(
        'OUTPUT_STALE',
        `No cached scene is available for capture key "${captureKey}".`,
        { cause },
      );
    }

    const snapshotDir = path.join(captureDir, pointer.sceneHash);
    try {
      return await readSnapshot(snapshotDir, captureKey, pointer.sceneHash);
    } catch (cause) {
      if (cause instanceof GuideShotError) throw cause;
      throw new GuideShotError(
        'OUTPUT_STALE',
        `Cached scene "${captureKey}" is incomplete or invalid.`,
        { cause },
      );
    }
  }
}

export class CompositionCache {
  readonly #root: string;

  constructor(cacheDir: string) {
    this.#root = path.join(cacheDir, 'compositions');
  }

  async read(compositionKey: string): Promise<CachedComposition | undefined> {
    assertHash(compositionKey, 'composition key');
    const cacheDir = path.join(this.#root, compositionKey);
    try {
      const metadata = parseCompositionMetadata(
        await readFile(path.join(cacheDir, 'asset.json'), 'utf8'),
      );
      const bytes = Uint8Array.from(
        await readFile(path.join(cacheDir, `asset.${metadata.format}`)),
      );
      return validateComposition({ ...metadata, bytes });
    } catch (cause) {
      if (isMissing(cause)) return undefined;
      if (cause instanceof GuideShotError) throw cause;
      throw new GuideShotError(
        'OUTPUT_STALE',
        `Cached composition "${compositionKey}" is incomplete or invalid.`,
        { cause },
      );
    }
  }

  async write(
    compositionKey: string,
    composition: CachedComposition,
  ): Promise<CachedComposition> {
    assertHash(compositionKey, 'composition key');
    const validated = validateComposition(composition);
    await mkdir(this.#root, { recursive: true, mode: 0o700 });
    const cacheDir = path.join(this.#root, compositionKey);
    const existing = await this.read(compositionKey);
    if (existing !== undefined) {
      if (existing.hash !== validated.hash) {
        throw new GuideShotError(
          'OUTPUT_COLLISION',
          `Composition cache key "${compositionKey}" produced different bytes.`,
        );
      }
      return existing;
    }

    const staging = await mkdtemp(path.join(this.#root, '.composition-'));
    try {
      const metadata: CompositionMetadata = {
        version: 1,
        format: validated.format,
        mimeType: validated.mimeType,
        width: validated.width,
        height: validated.height,
        hash: validated.hash,
      };
      await Promise.all([
        writeFile(
          path.join(staging, `asset.${validated.format}`),
          validated.bytes,
          { mode: 0o600 },
        ),
        writeFile(
          path.join(staging, 'asset.json'),
          `${canonicalSerialize(metadata)}\n`,
          { encoding: 'utf8', mode: 0o600 },
        ),
      ]);
      try {
        await rename(staging, cacheDir);
      } catch (cause) {
        const concurrent = await this.read(compositionKey);
        if (concurrent === undefined) throw cause;
        if (concurrent.hash !== validated.hash) {
          throw new GuideShotError(
            'OUTPUT_COLLISION',
            `Composition cache key "${compositionKey}" produced different bytes.`,
            { cause },
          );
        }
        return concurrent;
      }
      return validated;
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  }
}

async function readSnapshot(
  snapshotDir: string,
  captureKey: string,
  expectedSceneHash: string,
): Promise<CachedScene> {
  const [sceneText, background] = await Promise.all([
    readFile(path.join(snapshotDir, 'scene.json'), 'utf8'),
    readFile(path.join(snapshotDir, 'background.png')),
  ]);
  const scene = parseScene(sceneText);
  if (scene.captureKey !== captureKey) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      `Cached scene capture key does not match "${captureKey}".`,
    );
  }
  const normalized = normalizeAndValidateScene(scene, background);
  const actualSceneHash = hashCanonical({
    scene: normalized,
    background: normalized.background.sha256,
  });
  if (actualSceneHash !== expectedSceneHash) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      'Cached scene metadata has been modified.',
    );
  }
  return {
    sceneHash: expectedSceneHash,
    scene: normalized,
    background: Uint8Array.from(background),
  };
}

function normalizeAndValidateScene(
  input: CapturedScene,
  background: Uint8Array,
): CapturedScene {
  if (input.version !== 1 || input.sanitized !== true) {
    throw new GuideShotError(
      'PRIVACY_POLICY_FAILED',
      'Only version 1 scenes explicitly marked as sanitized may be persisted.',
    );
  }
  const backgroundHash = sha256(background);
  if (input.background.sha256 !== backgroundHash) {
    throw new GuideShotError(
      'PRIVACY_POLICY_FAILED',
      'Sanitized scene background does not match its SHA-256 metadata.',
    );
  }
  const dimensions = imageSize(background);
  if (
    dimensions.type !== 'png' ||
    dimensions.width !== input.background.width ||
    dimensions.height !== input.background.height
  ) {
    throw new GuideShotError(
      'CAPTURE_FAILED',
      'Sanitized scene background format or dimensions do not match its metadata.',
    );
  }
  const targets = Object.fromEntries(
    Object.entries(input.targets).map(([id, target]) => [
      id,
      {
        rect: copyRect(target.rect),
        visible: target.visible,
        ...(target.borderRadius === undefined
          ? {}
          : { borderRadius: target.borderRadius }),
      },
    ]),
  );
  return {
    version: 1,
    captureKey: input.captureKey,
    recipeId: input.recipeId,
    variantKey: input.variantKey,
    variants: { ...input.variants },
    frame: copyRect(input.frame),
    viewport: {
      width: input.viewport.width,
      height: input.viewport.height,
      pixelRatio: input.viewport.pixelRatio,
      scrollX: input.viewport.scrollX,
      scrollY: input.viewport.scrollY,
    },
    targets,
    locale: input.locale,
    direction: input.direction,
    ...(input.theme === undefined ? {} : { theme: input.theme }),
    safeVariables: input.safeVariables,
    background: {
      file: 'background.png',
      width: input.background.width,
      height: input.background.height,
      format: 'png',
      sha256: backgroundHash,
    },
    environment: {
      driver: input.environment.driver,
      driverVersion: input.environment.driverVersion,
      browser: input.environment.browser,
      browserVersion: input.environment.browserVersion,
      ...(input.environment.platform === undefined
        ? {}
        : { platform: input.environment.platform }),
    },
    sanitized: true,
  };
}

function copyRect(rect: CapturedScene['frame']): CapturedScene['frame'] {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}

function parsePointer(source: string): ScenePointer {
  const value = JSON.parse(source) as unknown;
  if (
    value === null ||
    typeof value !== 'object' ||
    (value as { version?: unknown }).version !== 1 ||
    typeof (value as { sceneHash?: unknown }).sceneHash !== 'string'
  ) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      'Cached scene pointer is invalid.',
    );
  }
  const sceneHash = (value as { sceneHash: string }).sceneHash;
  assertHash(sceneHash, 'scene hash');
  return { version: 1, sceneHash };
}

function parseScene(source: string): CapturedScene {
  const value = JSON.parse(source) as unknown;
  if (
    value === null ||
    typeof value !== 'object' ||
    (value as { version?: unknown }).version !== 1 ||
    (value as { sanitized?: unknown }).sanitized !== true
  ) {
    throw new GuideShotError('OUTPUT_STALE', 'Cached scene JSON is invalid.');
  }
  return value as CapturedScene;
}

function parseCompositionMetadata(source: string): CompositionMetadata {
  const value = JSON.parse(source) as unknown;
  if (
    value === null ||
    typeof value !== 'object' ||
    (value as { version?: unknown }).version !== 1 ||
    ((value as { format?: unknown }).format !== 'png' &&
      (value as { format?: unknown }).format !== 'webp') ||
    typeof (value as { width?: unknown }).width !== 'number' ||
    typeof (value as { height?: unknown }).height !== 'number' ||
    typeof (value as { hash?: unknown }).hash !== 'string'
  ) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      'Cached composition metadata is invalid.',
    );
  }
  const metadata = value as CompositionMetadata;
  if (
    metadata.mimeType !==
    (metadata.format === 'png' ? 'image/png' : 'image/webp')
  ) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      'Cached composition MIME type is invalid.',
    );
  }
  assertHash(metadata.hash, 'composition asset hash');
  return metadata;
}

function validateComposition(
  composition: CachedComposition,
): CachedComposition {
  const dimensions = imageSize(composition.bytes);
  const mimeType = composition.format === 'png' ? 'image/png' : 'image/webp';
  if (
    dimensions.type !== composition.format ||
    dimensions.width !== composition.width ||
    dimensions.height !== composition.height ||
    composition.mimeType !== mimeType ||
    sha256(composition.bytes) !== composition.hash
  ) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      'Cached composition asset is invalid.',
    );
  }
  return {
    format: composition.format,
    mimeType: composition.mimeType,
    bytes: Uint8Array.from(composition.bytes),
    width: composition.width,
    height: composition.height,
    hash: composition.hash,
  };
}

async function writeAtomicJson(file: string, value: unknown): Promise<void> {
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporary, `${canonicalSerialize(value)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
      flag: 'wx',
    });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function isMissing(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}

function assertHash(value: string, label: string): void {
  if (!/^[a-f0-9]{64}$/.test(value)) {
    throw new GuideShotError('OUTPUT_STALE', `Invalid ${label} "${value}".`);
  }
}
