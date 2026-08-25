import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createGuideShotService } from '../src/service.js';
import { createFixture, fixtureRecipe, writeRecipe } from './helpers.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe('GuideShotService', () => {
  it('plans without server, scenario, dimensions, driver, or renderer side effects', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    fixture.state.scenarioEnabled = false;
    fixture.state.driverEnabled = false;
    fixture.state.rendererEnabled = false;
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: () => Promise.reject(new Error('Server must not be contacted.')),
    });

    const validated = await service.validate();
    const report = await service.plan({
      ids: ['account.balance'],
      tags: ['docs'],
    });

    expect(validated.ok).toBe(true);
    expect(report.ok).toBe(true);
    expect(report.jobs).toHaveLength(1);
    expect(report.jobs[0]?.status).toBe('planned');
    expect(fixture.state).toMatchObject({
      serverProbes: 0,
      scenarioPrepares: 0,
      dimensionResolves: 0,
      driverOpens: 0,
      rendererOpens: 0,
    });
  });

  it('captures once, persists only a sanitized scene cache, and recomposes offline', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });

    const captured = await service.capture();
    expect(captured.ok).toBe(true);
    expect(fixture.state).toMatchObject({
      serverProbes: 1,
      scenarioPrepares: 1,
      dimensionResolves: 1,
      driverOpens: 1,
      captures: 1,
      driverCloses: 1,
      rendererOpens: 1,
      renders: 1,
      rendererCloses: 1,
      cleanups: 1,
    });
    expect(fixture.state.renderRequests[0]?.annotations[0]?.text).toBe(
      'Balance for Acme',
    );

    const captureKey = captured.jobs[0]?.captureKey;
    expect(captureKey).toMatch(/^[a-f0-9]{64}$/);
    const captureDir = path.join(
      fixture.root,
      '.guideshot/cache/scenes',
      captureKey ?? '',
    );
    const pointer = JSON.parse(
      await readFile(path.join(captureDir, 'current.json'), 'utf8'),
    ) as { sceneHash: string };
    expect(new Set(await readdir(captureDir))).toEqual(
      new Set(['current.json', pointer.sceneHash]),
    );
    expect(
      (await readdir(path.join(captureDir, pointer.sceneHash))).sort(),
    ).toEqual(['background.png', 'scene.json']);
    const scene = JSON.parse(
      await readFile(
        path.join(captureDir, pointer.sceneHash, 'scene.json'),
        'utf8',
      ),
    ) as Record<string, unknown>;
    expect(scene).toMatchObject({
      sanitized: true,
      safeVariables: { account: 'Acme' },
    });
    expect(scene.background).toMatchObject({
      file: 'background.png',
      format: 'png',
    });
    const sceneText = JSON.stringify(scene);
    expect(sceneText).not.toContain('private DOM snapshot');
    expect(sceneText).not.toContain('private target text');
    expect(sceneText).not.toContain('private.example.test');
    expect(sceneText).not.toContain('/private/browser/path');

    const updatedRecipe = fixtureRecipe({
      annotations: [
        {
          id: 'balance-note',
          kind: 'callout',
          target: 'balance',
          content: 'Updated ${scenario.account}',
        },
      ],
      accessibility: { alt: 'Updated balance for ${scenario.account}' },
    });
    await writeRecipe(fixture.recipeFile, updatedRecipe);
    fixture.state.scenarioEnabled = false;
    fixture.state.driverEnabled = false;
    const offline = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: () =>
        Promise.reject(new Error('Compose must not contact the server.')),
    });

    const composed = await offline.compose();

    expect(composed.ok).toBe(true);
    expect(fixture.state.scenarioPrepares).toBe(1);
    expect(fixture.state.dimensionResolves).toBe(1);
    expect(fixture.state.driverOpens).toBe(1);
    expect(fixture.state.serverProbes).toBe(1);
    expect(fixture.state.renderRequests.at(-1)?.annotations[0]?.text).toBe(
      'Updated Acme',
    );
    const manifest = JSON.parse(
      await readFile(
        path.join(fixture.root, 'public/guideshot/manifest.json'),
        'utf8',
      ),
    ) as { entries: { variants: Record<string, { alt: string }> }[] };
    expect(manifest.entries[0]?.variants['mode=basic']?.alt).toBe(
      'Updated balance for Acme',
    );
    const publicText = JSON.stringify(manifest);
    expect(publicText).not.toContain('private-seed');
    expect(publicText).not.toContain('safeVariables');
    expect(publicText).not.toContain('targets');
    expect(publicText).not.toContain('environment');
  });

  it('leaves the published manifest untouched when composition fails', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });
    expect((await service.capture()).ok).toBe(true);
    const manifestFile = path.join(
      fixture.root,
      'public/guideshot/manifest.json',
    );
    const before = await readFile(manifestFile);
    fixture.state.rendererEnabled = false;

    const failed = await service.compose();

    expect(failed.ok).toBe(false);
    expect(failed.diagnostics[0]?.code).toBe('COMPOSITION_FAILED');
    expect(await readFile(manifestFile)).toEqual(before);
    expect(
      (await readdir(path.dirname(manifestFile))).filter((name) =>
        name.startsWith('.stage-'),
      ),
    ).toEqual([]);
  });

  it('rejects unsanitized capture data without publishing or caching a pointer', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    fixture.state.returnUnsanitizedScene = true;
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });

    const report = await service.capture();

    expect(report.ok).toBe(false);
    expect(report.diagnostics[0]?.code).toBe('PRIVACY_POLICY_FAILED');
    await expect(
      readFile(path.join(fixture.root, 'public/guideshot/manifest.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    const cacheRoot = path.join(fixture.root, '.guideshot/cache/scenes');
    await expect(readdir(cacheRoot)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('detects tampered immutable output assets', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });
    const captured = await service.capture();
    expect(captured.ok).toBe(true);
    const source = captured.jobs[0]?.asset?.src;
    expect(source).toBeDefined();
    await writeFile(
      path.join(fixture.root, 'public/guideshot', source ?? ''),
      'tampered',
    );

    const verified = await service.verify();

    expect(verified.ok).toBe(false);
    expect(verified.diagnostics[0]?.code).toBe('MANIFEST_INVALID');
  });
});
