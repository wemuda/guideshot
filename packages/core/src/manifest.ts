import path from 'node:path';

import {
  SCHEMA_VERSION,
  type ManifestEntry,
  type ManifestVariant,
  type OutputFormat,
  type PublicManifest,
} from '@guideshot/schema';

import { GuideShotError } from './diagnostics.js';
import { sanitizeFileSegment } from './safety.js';
import { validateManifest } from './validation.js';

export interface ManifestAssetInput {
  recipeId: string;
  title?: string;
  variantKey: string;
  src: string;
  width: number;
  height: number;
  format: OutputFormat;
  hash: string;
  alt: string;
}

export function buildPublicManifest(
  assets: readonly ManifestAssetInput[],
): PublicManifest {
  const entries = new Map<
    string,
    { title?: string; variants: Map<string, ManifestVariant> }
  >();

  for (const asset of assets) {
    assertPublicAsset(asset);
    const entry = entries.get(asset.recipeId) ?? {
      ...(asset.title === undefined ? {} : { title: asset.title }),
      variants: new Map<string, ManifestVariant>(),
    };
    if (
      entry.title !== undefined &&
      asset.title !== undefined &&
      entry.title !== asset.title
    ) {
      throw new GuideShotError(
        'OUTPUT_COLLISION',
        `Recipe "${asset.recipeId}" has conflicting manifest titles.`,
        { recipeId: asset.recipeId },
      );
    }
    if (entry.title === undefined && asset.title !== undefined) {
      entry.title = asset.title;
    }
    if (entry.variants.has(asset.variantKey)) {
      throw new GuideShotError(
        'OUTPUT_COLLISION',
        `Manifest variant "${asset.recipeId}::${asset.variantKey}" is duplicated.`,
        { recipeId: asset.recipeId },
      );
    }
    entry.variants.set(asset.variantKey, {
      src: asset.src,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      hash: asset.hash,
      alt: asset.alt,
    });
    entries.set(asset.recipeId, entry);
  }

  const manifestEntries: ManifestEntry[] = [...entries.entries()]
    .sort(([left], [right]) => compareStrings(left, right))
    .map(([id, entry]) => ({
      id,
      ...(entry.title === undefined ? {} : { title: entry.title }),
      variants: Object.fromEntries(
        [...entry.variants.entries()].sort(([left], [right]) =>
          compareStrings(left, right),
        ),
      ),
    }));

  return validateManifest({
    version: SCHEMA_VERSION,
    entries: manifestEntries,
  });
}

export function createAssetPath(
  recipeId: string,
  variantKey: string,
  hash: string,
  format: OutputFormat,
): string {
  assertHash(hash);
  const variant = variantKey === 'default' ? 'default' : variantKey;
  const filename = [
    sanitizeFileSegment(recipeId),
    sanitizeFileSegment(variant),
    hash.slice(0, 12),
  ].join('.');
  return `./assets/${filename}.${format}`;
}

function assertPublicAsset(asset: ManifestAssetInput): void {
  if (!isSafePublicSource(asset.src)) {
    throw new GuideShotError(
      'MANIFEST_INVALID',
      `Manifest source "${asset.src}" must be a relative asset path.`,
      { recipeId: asset.recipeId },
    );
  }
  if (
    !Number.isInteger(asset.width) ||
    asset.width <= 0 ||
    !Number.isInteger(asset.height) ||
    asset.height <= 0
  ) {
    throw new GuideShotError(
      'MANIFEST_INVALID',
      `Manifest variant "${asset.recipeId}::${asset.variantKey}" has invalid dimensions.`,
      { recipeId: asset.recipeId },
    );
  }
  assertHash(asset.hash);
}

function isSafePublicSource(source: string): boolean {
  if (
    source === '' ||
    source.includes('\0') ||
    source.includes('\\') ||
    source.includes('?') ||
    source.includes('#') ||
    path.posix.isAbsolute(source) ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(source)
  ) {
    return false;
  }
  const normalized = path.posix.normalize(source.replace(/^\.\//, ''));
  return (
    normalized.startsWith('assets/') &&
    normalized !== 'assets' &&
    !normalized.startsWith('../')
  );
}

function assertHash(hash: string): void {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new GuideShotError(
      'MANIFEST_INVALID',
      'Manifest asset hashes must be lowercase SHA-256 values.',
    );
  }
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
