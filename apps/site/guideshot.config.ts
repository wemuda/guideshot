import { defineConfig, defineDimension, defineScenario } from '@guideshot/core';
import { playwrightDriver } from '@guideshot/playwright';
import { htmlRenderer } from '@guideshot/renderer';

const PILOT_ORIGIN = 'http://localhost:3100';

const locale = defineDimension({
  name: 'pilot:locale',
  version: '2.0.0',
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
  version: '2.0.0',
  apiVersion: 1,
  values: ['light', 'dark'] as const,
  resolve(value: 'light' | 'dark') {
    return {
      colorScheme: value,
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot-ui-theme': value },
        },
      ],
    };
  },
});

const feature = defineDimension({
  name: 'pilot:feature',
  version: '1.0.0',
  apiVersion: 1,
  values: ['control', 'enabled', 'experiment'] as const,
  resolve(value: 'control' | 'enabled' | 'experiment') {
    return {
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot:feature': value },
        },
      ],
    };
  },
});

const role = defineDimension({
  name: 'pilot:role',
  version: '1.0.0',
  apiVersion: 1,
  values: ['viewer', 'editor', 'admin'] as const,
  resolve(value: 'viewer' | 'editor' | 'admin') {
    return {
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot:role': value },
        },
      ],
    };
  },
});

const plan = defineDimension({
  name: 'pilot:plan',
  version: '1.0.0',
  apiVersion: 1,
  values: ['starter', 'pro'] as const,
  resolve(value: 'starter' | 'pro') {
    return {
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot:plan': value },
        },
      ],
    };
  },
});

const diagnostic = defineDimension({
  name: 'pilot:diagnostic',
  version: '1.0.0',
  apiVersion: 1,
  values: ['missing', 'duplicate', 'hidden', 'unstable', 'origin'] as const,
  resolve(value: 'missing' | 'duplicate' | 'hidden' | 'unstable' | 'origin') {
    return {
      localStorage: [
        {
          origin: PILOT_ORIGIN,
          values: { 'guideshot:diagnostic': value },
        },
      ],
    };
  },
});

const authenticatedWorkspace = defineScenario({
  name: 'showcase:authenticated-workspace',
  version: '1.0.0',
  apiVersion: 1,
  datasetRevision: '2026-08-26',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      workspace: { type: 'string', minLength: 1 },
      user: { type: 'string', minLength: 1 },
      role: { type: 'string', enum: ['viewer', 'editor', 'admin'] },
    },
    required: ['workspace', 'user', 'role'],
  },
  prepare({ baseUrl }, input) {
    if (
      typeof input.workspace !== 'string' ||
      typeof input.user !== 'string' ||
      typeof input.role !== 'string'
    ) {
      throw new TypeError('The authenticated workspace input is invalid.');
    }
    const session = {
      workspace: input.workspace,
      user: input.user,
      role: input.role,
    };
    return {
      variables: session,
      browser: {
        localStorage: [
          {
            origin: baseUrl.origin,
            values: { 'guideshot:session': JSON.stringify(session) },
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
    command: 'pnpm dev --port 3100',
    timeoutMs: 30_000,
  },
  safety: { allowedOrigins: [PILOT_ORIGIN] },
  targetAttribute: 'data-guide-target',
  profiles: {
    'guide.desktop': {
      viewport: { width: 1280, height: 960 },
      pixelRatio: 2,
      timezoneId: 'Europe/Copenhagen',
      reducedMotion: 'reduce',
    },
    'guide.tablet': {
      viewport: { width: 820, height: 900 },
      pixelRatio: 2,
      timezoneId: 'Europe/Copenhagen',
      reducedMotion: 'reduce',
    },
    'guide.mobile': {
      viewport: { width: 390, height: 844 },
      pixelRatio: 2,
      timezoneId: 'Europe/Copenhagen',
      reducedMotion: 'reduce',
    },
  },
  dimensions: { diagnostic, feature, locale, plan, role, theme },
  scenarios: { 'showcase:authenticated-workspace': authenticatedWorkspace },
  driver: playwrightDriver(),
  renderer: htmlRenderer(),
});
