import { defineConfig, defineDimension, defineScenario } from '@guideshot/core';
import { playwrightDriver } from '@guideshot/playwright';
import { htmlRenderer } from '@guideshot/renderer';

const PILOT_ORIGIN = 'http://localhost:3000';

const locale = defineDimension({
  name: 'pilot:locale',
  version: '1.0.0',
  apiVersion: 1,
  values: ['en', 'da', 'nb'] as const,
  resolve(value: 'en' | 'da' | 'nb') {
    return {
      locale: value,
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot:locale': value },
        },
      ],
    };
  },
});

const theme = defineDimension({
  name: 'pilot:theme',
  version: '1.0.0',
  apiVersion: 1,
  values: ['light', 'dark'] as const,
  resolve(value: 'light' | 'dark') {
    return {
      colorScheme: value,
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot:theme': value },
        },
      ],
    };
  },
});

const authenticatedPilot = defineScenario({
  name: 'pilot:authenticated',
  version: '1.0.0',
  apiVersion: 1,
  schema: {
    type: 'object',
    additionalProperties: false,
  },
  prepare() {
    return {
      browser: {
        localStorage: [
          {
            origin: PILOT_ORIGIN,
            values: {
              'guideshot:demo-session': JSON.stringify({
                version: 1,
                userId: 'demo-admin',
              }),
            },
          },
        ],
      },
    };
  },
});

export default defineConfig({
  recipes: ['shots/**/*.shot.json'],
  outputDir: 'public/generated/guideshot',
  cacheDir: '.guideshot/cache',
  server: {
    url: PILOT_ORIGIN,
    command: 'pnpm dev',
    timeoutMs: 30_000,
  },
  safety: { allowedOrigins: [PILOT_ORIGIN] },
  targetAttribute: 'data-guide-target',
  profiles: {
    'guide.desktop': {
      viewport: { width: 1280, height: 960 },
      pixelRatio: 1,
      timezoneId: 'Europe/Copenhagen',
      reducedMotion: 'reduce',
    },
  },
  dimensions: { locale, theme },
  scenarios: { 'pilot:authenticated': authenticatedPilot },
  driver: playwrightDriver(),
  renderer: htmlRenderer(),
});
