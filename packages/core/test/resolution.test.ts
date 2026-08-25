import { describe, expect, it, vi } from 'vitest';

import {
  GuideShotError,
  planRecipes,
  resolveJob,
  type GuideShotConfig,
  type Recipe,
} from '../src/index.js';
import { config, recipe } from './helpers.js';

describe('job resolution cleanup ownership', () => {
  it('cleans up exactly once when a dimension fails after scenario preparation', async () => {
    const resolutionFailure = new Error('dimension resolution failed');
    const cleanup = vi.fn(() => Promise.resolve());
    const prepare = vi.fn(() => Promise.resolve({ cleanup }));
    const configured = resolutionConfig(prepare, {
      dimensions: {
        mode: {
          name: 'test:mode',
          version: '1',
          values: ['ready'],
          resolve() {
            throw resolutionFailure;
          },
        },
      },
    });
    const planned = job(
      configured,
      recipe({
        scenario: { use: 'test:scenario' },
        matrix: { dimensions: { mode: ['ready'] } },
      }),
    );

    await expect(
      resolveJob(planned, configured, {
        baseUrl: new URL(configured.server.url),
      }),
    ).rejects.toBe(resolutionFailure);
    expect(prepare).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('hands cleanup to the caller without invoking it on success', async () => {
    const cleanup = vi.fn(() => Promise.resolve());
    const configured = resolutionConfig(() => Promise.resolve({ cleanup }));
    const planned = job(
      configured,
      recipe({ scenario: { use: 'test:scenario' } }),
    );

    const resolved = await resolveJob(planned, configured, {
      baseUrl: new URL(configured.server.url),
    });

    expect(cleanup).not.toHaveBeenCalled();
    expect(resolved.cleanup).toBe(cleanup);
    await resolved.cleanup?.();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('preserves both failures when downstream resolution and cleanup fail', async () => {
    const cleanupFailure = new Error('cleanup failed');
    const cleanup = vi.fn(() => Promise.reject(cleanupFailure));
    const configured = resolutionConfig(() =>
      Promise.resolve({
        variables: { page: '/outside.example.test/shot' },
        cleanup,
      }),
    );
    const planned = job(
      configured,
      recipe({
        scenario: { use: 'test:scenario' },
        page: { path: '/${scenario.page}' },
      }),
    );

    const failure = await resolveJob(planned, configured, {
      baseUrl: new URL(configured.server.url),
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(GuideShotError);
    if (!(failure instanceof GuideShotError)) {
      throw new Error('Expected a GuideShotError.');
    }
    expect(failure.code).toBe('SCENARIO_FAILED');
    expect(failure.details?.resolutionError).toContain('outside.example.test');
    expect(failure.details?.cleanupError).toBe('cleanup failed');
    expect((failure as Error).cause).toBeInstanceOf(AggregateError);
    expect(((failure as Error).cause as AggregateError).errors).toEqual([
      expect.objectContaining({ code: 'ORIGIN_NOT_ALLOWED' }),
      cleanupFailure,
    ]);
    expect(cleanup).toHaveBeenCalledOnce();
  });
});

function resolutionConfig(
  prepare: NonNullable<GuideShotConfig['scenarios']>[string]['prepare'],
  overrides: Partial<GuideShotConfig> = {},
): GuideShotConfig {
  return config({
    scenarios: {
      'test:scenario': {
        name: 'test:scenario',
        version: '1',
        schema: { type: 'object', additionalProperties: false },
        prepare,
      },
    },
    ...overrides,
  });
}

function job(configured: GuideShotConfig, shot: Recipe) {
  const planned = planRecipes(configured, [
    { file: '/fixture.shot.json', recipe: shot },
  ]).jobs[0];
  if (planned === undefined) throw new Error('Expected one planned job.');
  return planned;
}
