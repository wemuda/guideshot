import { readFile } from 'node:fs/promises';

import {
  GuideShotError,
  resolveArtifactPath,
  type Plan,
  type PublicManifest,
} from '@guideshot/core';

import { verifyManifestAsset } from './assets.js';
import { jobIdentity, readExistingManifest } from './publication.js';
import type { JobReport } from './types.js';

export interface VerificationResult {
  readonly manifest: PublicManifest;
  readonly jobs: readonly JobReport[];
  readonly assets: number;
}

export async function verifyPublishedOutput(
  outputDir: string,
  plan: Plan,
): Promise<VerificationResult> {
  const manifest = await readExistingManifest(outputDir);
  if (manifest === undefined) {
    throw new GuideShotError(
      'OUTPUT_STALE',
      'No published GuideShot manifest is available.',
    );
  }

  const variants = new Map<
    string,
    (typeof manifest.entries)[number]['variants'][string]
  >();
  let assetCount = 0;
  for (const entry of manifest.entries) {
    for (const [variantKey, variant] of Object.entries(entry.variants)) {
      variants.set(jobIdentity(entry.id, variantKey), variant);
      const file = resolveArtifactPath(outputDir, variant.src);
      let bytes: Uint8Array;
      try {
        bytes = await readFile(file);
      } catch (cause) {
        throw new GuideShotError(
          'MANIFEST_INVALID',
          `Manifest asset "${variant.src}" is missing or unreadable.`,
          { recipeId: entry.id, cause },
        );
      }
      if (!variant.src.endsWith(`.${variant.format}`)) {
        throw new GuideShotError(
          'MANIFEST_INVALID',
          `Manifest asset "${variant.src}" has an extension that does not match its format.`,
          { recipeId: entry.id },
        );
      }
      verifyManifestAsset({
        bytes,
        format: variant.format,
        width: variant.width,
        height: variant.height,
        hash: variant.hash,
        source: variant.src,
      });
      assetCount += 1;
    }
  }

  const jobs: JobReport[] = [];
  for (const job of plan.jobs) {
    const variant = variants.get(jobIdentity(job.recipeId, job.variantKey));
    if (variant === undefined) {
      throw new GuideShotError(
        'OUTPUT_STALE',
        `Manifest is missing required variant "${job.recipeId}::${job.variantKey}".`,
        { recipeId: job.recipeId, jobKey: job.key },
      );
    }
    const decorative = 'decorative' in job.recipe.accessibility;
    if (
      (decorative && variant.alt !== '') ||
      (!decorative && variant.alt === '')
    ) {
      throw new GuideShotError(
        'MANIFEST_INVALID',
        decorative
          ? `Decorative variant "${job.key}" must publish empty alt text.`
          : `Variant "${job.key}" must publish authored alt text.`,
        { recipeId: job.recipeId, jobKey: job.key },
      );
    }
    jobs.push({
      key: job.key,
      recipeId: job.recipeId,
      variantKey: job.variantKey,
      captureKey: job.captureKey,
      status: 'verified',
      asset: {
        src: variant.src,
        format: variant.format,
        hash: variant.hash,
        width: variant.width,
        height: variant.height,
      },
    });
  }

  return { manifest, jobs, assets: assetCount };
}
