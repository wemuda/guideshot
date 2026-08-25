import {
  GuideShotError,
  sha256,
  type OutputFormat,
  type RenderedAsset,
} from '@guideshot/core';
import { imageSize } from 'image-size';

export interface VerifiedAsset {
  readonly format: OutputFormat;
  readonly mimeType: 'image/png' | 'image/webp';
  readonly bytes: Uint8Array;
  readonly width: number;
  readonly height: number;
  readonly hash: string;
}

export function verifyRenderedAsset(asset: RenderedAsset): VerifiedAsset {
  const dimensions = imageSize(asset.bytes);
  if (
    dimensions.type !== asset.format ||
    dimensions.width !== asset.width ||
    dimensions.height !== asset.height ||
    asset.mimeType !== mimeType(asset.format)
  ) {
    throw new GuideShotError(
      'COMPOSITION_FAILED',
      `Renderer returned invalid ${asset.format.toUpperCase()} metadata.`,
    );
  }
  return { ...asset, hash: sha256(asset.bytes) };
}

export function verifyManifestAsset(input: {
  readonly bytes: Uint8Array;
  readonly format: OutputFormat;
  readonly width: number;
  readonly height: number;
  readonly hash: string;
  readonly source: string;
}): void {
  const actualHash = sha256(input.bytes);
  if (actualHash !== input.hash) {
    throw new GuideShotError(
      'MANIFEST_INVALID',
      `Asset "${input.source}" does not match its manifest hash.`,
    );
  }
  const dimensions = imageSize(input.bytes);
  if (
    dimensions.type !== input.format ||
    dimensions.width !== input.width ||
    dimensions.height !== input.height
  ) {
    throw new GuideShotError(
      'MANIFEST_INVALID',
      `Asset "${input.source}" does not match its manifest format or dimensions.`,
    );
  }
}

function mimeType(format: OutputFormat): 'image/png' | 'image/webp' {
  return format === 'png' ? 'image/png' : 'image/webp';
}
