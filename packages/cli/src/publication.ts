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

import {
  buildPublicManifest,
  canonicalSerialize,
  GuideShotError,
  resolveArtifactPath,
  sha256,
  validateManifest,
  type ManifestAssetInput,
  type PublicManifest,
} from '@guideshot/core';

export interface StagedAsset {
  readonly manifest: ManifestAssetInput;
  readonly bytes: Uint8Array;
}

interface TransactionAsset {
  readonly asset: StagedAsset;
  readonly staged: boolean;
}

export type ManifestReplacementScope =
  | { readonly mode: 'all' }
  | { readonly mode: 'recipes'; readonly recipeIds: ReadonlySet<string> }
  | { readonly mode: 'variants'; readonly jobKeys: ReadonlySet<string> };

export class OutputTransaction {
  readonly #outputDir: string;
  readonly #stagingDir: string;
  readonly #assets: TransactionAsset[] = [];
  #closed = false;

  private constructor(outputDir: string, stagingDir: string) {
    this.#outputDir = outputDir;
    this.#stagingDir = stagingDir;
  }

  static async create(outputDir: string): Promise<OutputTransaction> {
    await mkdir(outputDir, { recursive: true });
    const stagingDir = await mkdtemp(path.join(outputDir, '.stage-'));
    return new OutputTransaction(outputDir, stagingDir);
  }

  async stage(asset: StagedAsset): Promise<void> {
    this.#assertOpen();
    const relative = asset.manifest.src.replace(/^\.\//, '');
    const published = resolveArtifactPath(this.#outputDir, relative);
    if (await exists(published)) {
      this.#assets.push({ asset, staged: false });
      return;
    }
    const destination = resolveArtifactPath(this.#stagingDir, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, asset.bytes, { flag: 'wx' });
    this.#assets.push({ asset, staged: true });
  }

  async commit(
    manifest: PublicManifest,
    previousManifest?: PublicManifest,
  ): Promise<void> {
    this.#assertOpen();
    const manifestFile = path.join(this.#stagingDir, 'manifest.json');
    await writeFile(manifestFile, `${canonicalSerialize(manifest)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    });

    for (const { asset, staged: wasStaged } of [...this.#assets].sort(
      (left, right) =>
        compareStrings(left.asset.manifest.src, right.asset.manifest.src),
    )) {
      const relative = asset.manifest.src.replace(/^\.\//, '');
      const staged = resolveArtifactPath(this.#stagingDir, relative);
      const destination = resolveArtifactPath(this.#outputDir, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      if (await exists(destination)) {
        const existing = await readFile(destination);
        if (sha256(existing) !== asset.manifest.hash) {
          throw new GuideShotError(
            'OUTPUT_COLLISION',
            `Immutable output asset "${asset.manifest.src}" already exists with different bytes.`,
          );
        }
        if (wasStaged) await rm(staged, { force: true });
      } else {
        if (!wasStaged) {
          await mkdir(path.dirname(staged), { recursive: true });
          await writeFile(staged, asset.bytes, { flag: 'wx' });
        }
        await rename(staged, destination);
      }
    }

    // The manifest is the publication pointer and is always renamed last.
    await rename(manifestFile, path.join(this.#outputDir, 'manifest.json'));
    await removeObsoleteAssets(this.#outputDir, previousManifest, manifest);
    await this.close();
  }

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    await rm(this.#stagingDir, { recursive: true, force: true });
  }

  #assertOpen(): void {
    if (this.#closed) throw new Error('Output transaction is closed.');
  }
}

export async function readExistingManifest(
  outputDir: string,
): Promise<PublicManifest | undefined> {
  const file = path.join(outputDir, 'manifest.json');
  try {
    return validateManifest(
      JSON.parse(await readFile(file, 'utf8')) as unknown,
      file,
    );
  } catch (cause) {
    if (isMissing(cause)) return undefined;
    if (cause instanceof GuideShotError) throw cause;
    throw new GuideShotError(
      'MANIFEST_INVALID',
      `Cannot read manifest "${file}".`,
      {
        cause,
      },
    );
  }
}

export function mergeManifest(
  existing: PublicManifest | undefined,
  replacements: readonly ManifestAssetInput[],
  scope: ManifestReplacementScope,
): PublicManifest {
  const replacementTitles = new Map(
    replacements.map((replacement) => [
      replacement.recipeId,
      replacement.title,
    ]),
  );
  const retained: ManifestAssetInput[] = [];
  for (const entry of existing?.entries ?? []) {
    for (const [variantKey, variant] of Object.entries(entry.variants)) {
      if (replacesVariant(scope, entry.id, variantKey)) continue;
      const title = replacementTitles.has(entry.id)
        ? replacementTitles.get(entry.id)
        : entry.title;
      retained.push({
        recipeId: entry.id,
        ...(title === undefined ? {} : { title }),
        variantKey,
        ...variant,
      });
    }
  }
  return buildPublicManifest([...retained, ...replacements]);
}

function replacesVariant(
  scope: ManifestReplacementScope,
  recipeId: string,
  variantKey: string,
): boolean {
  switch (scope.mode) {
    case 'all':
      return true;
    case 'recipes':
      return scope.recipeIds.has(recipeId);
    case 'variants':
      return scope.jobKeys.has(jobIdentity(recipeId, variantKey));
  }
}

export function jobIdentity(recipeId: string, variantKey: string): string {
  return `${recipeId}\0${variantKey}`;
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

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function removeObsoleteAssets(
  outputDir: string,
  previousManifest: PublicManifest | undefined,
  manifest: PublicManifest,
): Promise<void> {
  if (previousManifest === undefined) return;
  const currentAssets = manifestAssetPaths(outputDir, manifest);
  const previousAssets = manifestAssetPaths(outputDir, previousManifest);
  for (const file of [...previousAssets].sort(compareStrings)) {
    if (!currentAssets.has(file)) await rm(file, { force: true });
  }
}

function manifestAssetPaths(
  outputDir: string,
  manifest: PublicManifest,
): ReadonlySet<string> {
  return new Set(
    manifest.entries.flatMap((entry) =>
      Object.values(entry.variants).map((variant) =>
        resolveArtifactPath(outputDir, variant.src),
      ),
    ),
  );
}
