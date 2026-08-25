import type { JsonObject } from '@guideshot/schema';

export const DIAGNOSTIC_CODES = [
  'RECIPE_SCHEMA_INVALID',
  'EXTENSION_NOT_REGISTERED',
  'VARIABLE_UNRESOLVED',
  'SERVER_NOT_READY',
  'ORIGIN_NOT_ALLOWED',
  'SCENARIO_FAILED',
  'NAVIGATION_FAILED',
  'TARGET_NOT_FOUND',
  'TARGET_NOT_UNIQUE',
  'TARGET_NOT_VISIBLE',
  'EXPECTATION_FAILED',
  'LAYOUT_UNSTABLE',
  'ANNOTATION_LAYOUT_FAILED',
  'PRIVACY_POLICY_FAILED',
  'CAPTURE_FAILED',
  'COMPOSITION_FAILED',
  'OUTPUT_COLLISION',
  'MANIFEST_INVALID',
  'OUTPUT_STALE',
] as const;

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[number];

export type DiagnosticSeverity = 'error' | 'warning';

export interface DiagnosticLocation {
  file?: string;
  path?: string;
  line?: number;
  column?: number;
}

export interface Diagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  hint?: string;
  recipeId?: string;
  jobKey?: string;
  location?: DiagnosticLocation;
  details?: JsonObject;
}

export interface GuideShotErrorOptions {
  hint?: string;
  recipeId?: string;
  jobKey?: string;
  location?: DiagnosticLocation;
  details?: JsonObject;
  cause?: unknown;
}

export class GuideShotError extends Error {
  override readonly name = 'GuideShotError';
  readonly code: DiagnosticCode;
  readonly hint: string | undefined;
  readonly recipeId: string | undefined;
  readonly jobKey: string | undefined;
  readonly location: DiagnosticLocation | undefined;
  readonly details: JsonObject | undefined;

  constructor(
    code: DiagnosticCode,
    message: string,
    options: GuideShotErrorOptions = {},
  ) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.code = code;
    this.hint = options.hint;
    this.recipeId = options.recipeId;
    this.jobKey = options.jobKey;
    this.location = options.location;
    this.details = options.details;
  }

  toDiagnostic(): Diagnostic {
    return {
      code: this.code,
      severity: 'error',
      message: this.message,
      ...(this.hint === undefined ? {} : { hint: this.hint }),
      ...(this.recipeId === undefined ? {} : { recipeId: this.recipeId }),
      ...(this.jobKey === undefined ? {} : { jobKey: this.jobKey }),
      ...(this.location === undefined ? {} : { location: this.location }),
      ...(this.details === undefined ? {} : { details: this.details }),
    };
  }
}

export function isGuideShotError(error: unknown): error is GuideShotError {
  return error instanceof GuideShotError;
}

export function diagnosticFromUnknown(
  error: unknown,
  fallbackCode: DiagnosticCode,
): Diagnostic {
  if (isGuideShotError(error)) {
    return error.toDiagnostic();
  }

  return {
    code: fallbackCode,
    severity: 'error',
    message: error instanceof Error ? error.message : String(error),
  };
}
