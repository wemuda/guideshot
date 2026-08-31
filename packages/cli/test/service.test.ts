import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  createJobCompositionHash,
  planProject,
  PublicManifestSchema,
  RecipeSchema,
  SCHEMA_VERSION,
} from '@guideshot/core';
import { afterEach, describe, expect, it } from 'vitest';

import { createGuideShotService } from '../src/service.js';
import { createFixture, fixtureRecipe, PNG, writeRecipe } from './helpers.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe('GuideShotService', () => {
  it('atomically writes the current portable schemas at stable paths', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'guideshot-cli-schema-'));
    roots.push(root);
    const report = await createGuideShotService({ cwd: root }).schema();
    const schemaDir = path.join(root, '.guideshot');
    const recipe = JSON.parse(
      await readFile(path.join(schemaDir, 'recipe.schema.json'), 'utf8'),
    ) as Record<string, unknown>;
    const manifest = JSON.parse(
      await readFile(path.join(schemaDir, 'manifest.schema.json'), 'utf8'),
    ) as Record<string, unknown>;

    expect(report).toMatchObject({
      version: 1,
      command: 'schema',
      ok: true,
      summary: { recipes: 0, jobs: 0 },
      jobs: [],
      diagnostics: [],
      outputs: [
        '.guideshot/recipe.schema.json',
        '.guideshot/manifest.schema.json',
      ],
    });
    expect((await readdir(schemaDir)).sort()).toEqual([
      'manifest.schema.json',
      'recipe.schema.json',
    ]);
    expect(recipe).toEqual(JSON.parse(JSON.stringify(RecipeSchema)));
    expect(manifest).toEqual(JSON.parse(JSON.stringify(PublicManifestSchema)));
    expect(recipe).toMatchObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: { version: { const: SCHEMA_VERSION } },
    });
    expect(manifest).toMatchObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: { version: { const: SCHEMA_VERSION } },
    });
  });

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
    const progress: unknown[] = [];
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
      onCaptureProgress: (event) => progress.push(event),
    });

    const captured = await service.capture();
    expect(captured.ok).toBe(true);
    expect(progress).toEqual([
      { phase: 'preparing', completed: 0, total: 1 },
      {
        phase: 'capturing',
        completed: 0,
        total: 1,
        jobKey: 'account.balance::mode=basic',
      },
      {
        phase: 'capturing',
        completed: 1,
        total: 1,
        jobKey: 'account.balance::mode=basic',
      },
      { phase: 'publishing', completed: 1, total: 1 },
      { phase: 'complete', completed: 1, total: 1 },
    ]);
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
    const plan = await planProject(fixture.config, fixture.root);
    expect(captured.jobs[0]?.compositionKey).toBe(
      createJobCompositionHash(plan.jobs[0]!, pointer.sceneHash),
    );
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

  it('replaces the full manifest when an unfiltered matrix shrinks', async () => {
    const fixture = await createFixture(
      fixtureRecipe({ matrix: { dimensions: { mode: ['basic', 'pro'] } } }),
    );
    roots.push(fixture.root);
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });

    const initial = await service.capture();
    expect(initial.jobs).toHaveLength(2);
    const removedAsset = initial.jobs.find(
      (job) => job.variantKey === 'mode=pro',
    )?.asset?.src;
    expect(removedAsset).toBeDefined();
    await writeRecipe(fixture.recipeFile, fixtureRecipe());

    const captured = await service.capture();
    const manifest = await readManifest(fixture.root);

    expect(captured.ok).toBe(true);
    expect(Object.keys(manifest.entries[0]?.variants ?? {})).toEqual([
      'mode=basic',
    ]);
    await expect(
      readFile(path.join(fixture.root, 'public/guideshot', removedAsset ?? '')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('removes a superseded asset after publishing its replacement', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });

    const captured = await service.capture();
    const previousAsset = captured.jobs[0]?.asset?.src;
    expect(previousAsset).toMatch(/\.webp$/);
    await writeRecipe(
      fixture.recipeFile,
      fixtureRecipe({ output: { formats: ['png'] } }),
    );

    const composed = await service.compose();
    const currentAsset = composed.jobs[0]?.asset?.src;

    expect(composed.ok).toBe(true);
    expect(currentAsset).toMatch(/\.png$/);
    await expect(
      readFile(
        path.join(fixture.root, 'public/guideshot', previousAsset ?? ''),
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(path.join(fixture.root, 'public/guideshot', currentAsset ?? '')),
    ).resolves.toEqual(Buffer.from(PNG));
  });

  it('replaces every variant for tag-selected recipes while retaining other recipes', async () => {
    const fixture = await createFixture(
      fixtureRecipe({ matrix: { dimensions: { mode: ['basic', 'pro'] } } }),
    );
    roots.push(fixture.root);
    await writeRecipe(
      path.join(fixture.root, 'other.shot.json'),
      fixtureRecipe({
        id: 'other.recipe',
        title: 'Other recipe',
        tags: ['other'],
        matrix: { dimensions: { mode: ['basic', 'pro'] } },
      }),
    );
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });

    expect((await service.capture()).jobs).toHaveLength(4);
    await writeRecipe(fixture.recipeFile, fixtureRecipe());

    const captured = await service.capture({ tags: ['docs'] });
    const manifest = await readManifest(fixture.root);

    expect(captured.ok).toBe(true);
    expect(Object.keys(variantsFor(manifest, 'account.balance'))).toEqual([
      'mode=basic',
    ]);
    expect(Object.keys(variantsFor(manifest, 'other.recipe'))).toEqual([
      'mode=basic',
      'mode=pro',
    ]);
    expect((await service.verify()).ok).toBe(true);
  });

  it('preserves unselected variants for explicit dimension filters', async () => {
    const fixture = await createFixture(
      fixtureRecipe({
        title: 'Original title',
        matrix: { dimensions: { mode: ['basic', 'pro'] } },
        accessibility: { alt: 'Original balance' },
      }),
    );
    roots.push(fixture.root);
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
      fetch: fixture.fetch,
    });
    expect((await service.capture()).jobs).toHaveLength(2);
    await writeRecipe(
      fixture.recipeFile,
      fixtureRecipe({
        title: 'Updated title',
        matrix: { dimensions: { mode: ['basic', 'pro'] } },
        accessibility: { alt: 'Updated balance' },
      }),
    );

    const composed = await service.compose({
      dimensionArguments: ['mode=basic'],
    });
    const manifest = await readManifest(fixture.root);
    const variants = variantsFor(manifest, 'account.balance');

    expect(composed.ok).toBe(true);
    expect(composed.jobs).toHaveLength(1);
    expect(manifest.entries[0]?.title).toBe('Updated title');
    expect(variants['mode=basic']?.alt).toBe('Updated balance');
    expect(variants['mode=pro']?.alt).toBe('Original balance');
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

interface TestManifest {
  readonly entries: readonly {
    readonly id: string;
    readonly title?: string;
    readonly variants: Readonly<Record<string, { readonly alt: string }>>;
  }[];
}

async function readManifest(root: string): Promise<TestManifest> {
  return JSON.parse(
    await readFile(path.join(root, 'public/guideshot/manifest.json'), 'utf8'),
  ) as TestManifest;
}

function variantsFor(
  manifest: TestManifest,
  recipeId: string,
): TestManifest['entries'][number]['variants'] {
  const entry = manifest.entries.find((candidate) => candidate.id === recipeId);
  if (entry === undefined)
    throw new Error(`Missing manifest entry "${recipeId}".`);
  return entry.variants;
}
