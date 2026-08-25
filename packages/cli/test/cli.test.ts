import { rm } from 'node:fs/promises';

import { afterEach, describe, expect, it } from 'vitest';

import { parseCliArgs } from '../src/args.js';
import { runCli } from '../src/cli.js';
import { createGuideShotService } from '../src/service.js';
import type { CliIo } from '../src/types.js';
import { createFixture } from './helpers.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe('CLI', () => {
  it('parses repeatable selectors with Node parseArgs semantics', () => {
    expect(
      parseCliArgs([
        'plan',
        '--id',
        'a',
        '--id=b',
        '--tag',
        'docs',
        '-d',
        'mode=basic',
        '--json',
      ]),
    ).toMatchObject({
      command: 'plan',
      ids: ['a', 'b'],
      tags: ['docs'],
      dimensions: ['mode=basic'],
      json: true,
    });
  });

  it('emits a versioned, stable JSON report', async () => {
    const fixture = await createFixture();
    roots.push(fixture.root);
    const chunks = { stdout: '', stderr: '' };
    const io: CliIo = {
      stdout: { write: (chunk) => (chunks.stdout += chunk) },
      stderr: { write: (chunk) => (chunks.stderr += chunk) },
    };
    const service = createGuideShotService({
      cwd: fixture.root,
      config: fixture.config,
    });

    const exitCode = await runCli(
      ['plan', '--dimension=mode=basic', '--json'],
      { io, service },
    );

    expect(exitCode).toBe(0);
    expect(chunks.stderr).toBe('');
    expect(JSON.parse(chunks.stdout)).toMatchObject({
      version: 1,
      command: 'plan',
      ok: true,
      summary: { recipes: 1, jobs: 1 },
    });
    const first = chunks.stdout;
    chunks.stdout = '';
    expect(
      await runCli(['plan', '--dimension=mode=basic', '--json'], {
        io,
        service,
      }),
    ).toBe(0);
    expect(chunks.stdout).toBe(first);
  });
});
