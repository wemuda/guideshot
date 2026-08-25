import { access } from 'node:fs/promises';
import path from 'node:path';

import { validateConfig, type GuideShotConfig } from '@guideshot/core';
import { createJiti } from 'jiti';

export interface LoadedConfig {
  readonly config: GuideShotConfig;
  readonly file: string;
  readonly projectRoot: string;
}

const CONFIG_NAMES = [
  'guideshot.config.ts',
  'guideshot.config.mts',
  'guideshot.config.js',
  'guideshot.config.mjs',
] as const;

export async function loadGuideShotConfig(
  cwd: string,
  configuredFile?: string,
): Promise<LoadedConfig> {
  const file = configuredFile
    ? path.resolve(cwd, configuredFile)
    : await findConfigFile(cwd);
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    sourceMaps: true,
    tsconfigPaths: true,
  });
  const candidate = await jiti.import<unknown>(file, { default: true });
  if (candidate === null || typeof candidate !== 'object') {
    throw new TypeError(
      `GuideShot config "${file}" must default-export an object.`,
    );
  }
  const config = candidate as GuideShotConfig;
  validateConfig(config);
  return { config, file, projectRoot: path.dirname(file) };
}

async function findConfigFile(cwd: string): Promise<string> {
  for (const name of CONFIG_NAMES) {
    const candidate = path.resolve(cwd, name);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Keep looking in the deterministic preference order.
    }
  }
  throw new TypeError(
    `No GuideShot config found in "${path.resolve(cwd)}". Use --config to select one.`,
  );
}
