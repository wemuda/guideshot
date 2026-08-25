import { canonicalSerialize, diagnosticFromUnknown } from '@guideshot/core';

import { CLI_USAGE, parseCliArgs } from './args.js';
import { createGuideShotService, type GuideShotService } from './service.js';
import type {
  CliIo,
  CommandName,
  CommandReport,
  ServiceOptions,
} from './types.js';

export const CLI_VERSION = '0.1.0';

export interface RunCliOptions {
  readonly cwd?: string;
  readonly io?: CliIo;
  readonly service?: GuideShotService;
  readonly signal?: AbortSignal;
  readonly fetch?: typeof globalThis.fetch;
}

export async function runCli(
  argv: readonly string[],
  options: RunCliOptions = {},
): Promise<number> {
  const io = options.io ?? process;
  let json = argv.includes('--json');
  try {
    const parsed = parseCliArgs(argv);
    json = parsed.json;
    if (parsed.help) {
      io.stdout.write(CLI_USAGE);
      return 0;
    }
    if (parsed.version) {
      io.stdout.write(`${CLI_VERSION}\n`);
      return 0;
    }
    if (parsed.command === undefined) {
      io.stderr.write(CLI_USAGE);
      return 1;
    }

    const service =
      options.service ??
      createGuideShotService({
        ...(options.cwd === undefined ? {} : { cwd: options.cwd }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
      } satisfies ServiceOptions);
    const report = await service.execute(parsed.command, {
      ...(parsed.configFile === undefined
        ? {}
        : { configFile: parsed.configFile }),
      ...(parsed.ids.length === 0 ? {} : { ids: parsed.ids }),
      ...(parsed.tags.length === 0 ? {} : { tags: parsed.tags }),
      ...(parsed.dimensions.length === 0
        ? {}
        : { dimensionArguments: parsed.dimensions }),
    });
    writeReport(io, report, parsed.json);
    return report.ok ? 0 : 1;
  } catch (error) {
    const command = commandFromArgv(argv);
    const report: CommandReport = {
      version: 1,
      command,
      ok: false,
      summary: { recipes: 0, jobs: 0 },
      jobs: [],
      diagnostics: [diagnosticFromUnknown(error, 'RECIPE_SCHEMA_INVALID')],
    };
    writeReport(io, report, json);
    return 1;
  }
}

export function formatHumanReport(report: CommandReport): string {
  if (!report.ok) {
    const diagnostics = report.diagnostics
      .map((diagnostic) => `  [${diagnostic.code}] ${diagnostic.message}`)
      .join('\n');
    return [
      `guideshot ${report.command} failed`,
      diagnostics,
      diagnostics === '' ? '' : '',
    ]
      .filter((line, index, lines) => line !== '' || index === lines.length - 1)
      .join('\n');
  }

  const recipes = plural(report.summary.recipes, 'recipe');
  const jobs = plural(report.summary.jobs, 'job');
  const lines = [`guideshot ${report.command}: ${recipes}, ${jobs}`];
  for (const job of report.jobs) {
    const asset = job.asset === undefined ? '' : ` -> ${job.asset.src}`;
    lines.push(`  ${job.status.padEnd(8)} ${job.key}${asset}`);
  }
  for (const output of report.outputs ?? []) {
    lines.push(`  wrote    ${output}`);
  }
  lines.push('');
  return lines.join('\n');
}

function writeReport(io: CliIo, report: CommandReport, json: boolean): void {
  const output = json
    ? `${canonicalSerialize(report)}\n`
    : formatHumanReport(report);
  if (report.ok) io.stdout.write(output);
  else io.stderr.write(output);
}

function commandFromArgv(argv: readonly string[]): CommandName {
  const candidate = argv.find((argument) => !argument.startsWith('-'));
  switch (candidate) {
    case 'validate':
    case 'schema':
    case 'plan':
    case 'capture':
    case 'compose':
    case 'verify':
      return candidate;
    default:
      return 'validate';
  }
}

function plural(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

export async function main(
  argv: readonly string[] = process.argv.slice(2),
): Promise<number> {
  const controller = new AbortController();
  const abort = (signal: NodeJS.Signals) => controller.abort(new Error(signal));
  const onInterrupt = () => abort('SIGINT');
  const onTerminate = () => abort('SIGTERM');
  process.once('SIGINT', onInterrupt);
  process.once('SIGTERM', onTerminate);
  try {
    return await runCli(argv, { signal: controller.signal });
  } finally {
    process.removeListener('SIGINT', onInterrupt);
    process.removeListener('SIGTERM', onTerminate);
  }
}
