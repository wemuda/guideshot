import { parseArgs } from 'node:util';

import type { CommandName } from './types.js';

export interface ParsedCliArgs {
  readonly command?: CommandName;
  readonly configFile?: string;
  readonly ids: readonly string[];
  readonly tags: readonly string[];
  readonly dimensions: readonly string[];
  readonly json: boolean;
  readonly help: boolean;
  readonly version: boolean;
}

const COMMANDS = new Set<CommandName>([
  'validate',
  'schema',
  'plan',
  'capture',
  'compose',
  'verify',
]);

export function parseCliArgs(argv: readonly string[]): ParsedCliArgs {
  const parsed = parseArgs({
    args: [...argv],
    allowPositionals: true,
    strict: true,
    options: {
      config: { type: 'string', short: 'c' },
      id: { type: 'string', multiple: true },
      tag: { type: 'string', multiple: true },
      dimension: { type: 'string', multiple: true, short: 'd' },
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  if (parsed.positionals.length > 1) {
    throw new TypeError('GuideShot accepts exactly one command.');
  }
  const positional = parsed.positionals[0];
  if (positional !== undefined && !COMMANDS.has(positional as CommandName)) {
    throw new TypeError(`Unknown GuideShot command "${positional}".`);
  }
  const command = positional as CommandName | undefined;
  return {
    ...(command === undefined ? {} : { command }),
    ...(parsed.values.config === undefined
      ? {}
      : { configFile: parsed.values.config }),
    ids: parsed.values.id ?? [],
    tags: parsed.values.tag ?? [],
    dimensions: parsed.values.dimension ?? [],
    json: parsed.values.json ?? false,
    help: parsed.values.help ?? false,
    version: parsed.values.version ?? false,
  };
}

export const CLI_USAGE = `Usage: guideshot <command> [options]

Commands:
  validate   Validate configuration and recipes without launching a browser
  schema     Write core project and manifest JSON schemas
  plan       Print deterministic capture jobs without preparing application state
  capture    Capture scenes, compose assets, and atomically publish the manifest
  compose    Recompose assets from cached sanitized scenes
  verify     Verify manifest coverage and asset integrity

Options:
  -c, --config <file>          GuideShot config file
      --id <recipe-id>         Select a recipe; repeatable
      --tag <tag>              Require a tag; repeatable
  -d, --dimension <name=value> Filter a dimension; repeatable
      --json                   Emit a versioned JSON report
  -h, --help                   Show this help
  -v, --version                Show the CLI version
`;
