import type {
  Diagnostic,
  GuideShotConfig,
  OutputFormat,
  VariantValue,
} from '@guideshot/core';

export type CommandName =
  'validate' | 'schema' | 'plan' | 'capture' | 'compose' | 'verify';

export interface CommandSelection {
  readonly ids?: readonly string[];
  readonly tags?: readonly string[];
  readonly dimensions?: Readonly<Record<string, VariantValue>>;
}

export interface CommandOptions extends CommandSelection {
  readonly configFile?: string;
  readonly concurrency?: number;
  /** Raw `name=value` filters accepted by the CLI entry point. */
  readonly dimensionArguments?: readonly string[];
}

export type JobStatus = 'planned' | 'captured' | 'composed' | 'verified';

export interface JobReport {
  readonly key: string;
  readonly recipeId: string;
  readonly variantKey: string;
  readonly status: JobStatus;
  readonly captureKey: string;
  readonly compositionKey?: string;
  readonly asset?: {
    readonly src: string;
    readonly format: OutputFormat;
    readonly hash: string;
    readonly width: number;
    readonly height: number;
  };
}

export interface CommandSummary {
  readonly recipes: number;
  readonly jobs: number;
  readonly assets?: number;
}

export interface CommandReport {
  readonly version: 1;
  readonly command: CommandName;
  readonly ok: boolean;
  readonly summary: CommandSummary;
  readonly jobs: readonly JobReport[];
  readonly diagnostics: readonly Diagnostic[];
  readonly outputs?: readonly string[];
}

export type CaptureProgressPhase =
  'preparing' | 'capturing' | 'publishing' | 'complete';

export interface CaptureProgress {
  readonly phase: CaptureProgressPhase;
  readonly completed: number;
  readonly total: number;
  readonly jobKey?: string;
}

export interface ServiceOptions {
  readonly cwd?: string;
  readonly config?: GuideShotConfig;
  readonly configFile?: string;
  readonly signal?: AbortSignal;
  readonly fetch?: typeof globalThis.fetch;
  readonly onCaptureProgress?: (progress: CaptureProgress) => void;
}

export interface CliIo {
  readonly stdout: { write(chunk: string): unknown };
  readonly stderr: {
    write(chunk: string): unknown;
    readonly isTTY?: boolean;
  };
}
