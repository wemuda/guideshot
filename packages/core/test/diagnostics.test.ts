import { describe, expect, it } from 'vitest';

import {
  GuideShotError,
  diagnosticFromUnknown,
  isGuideShotError,
} from '../src/index.js';

describe('diagnostics', () => {
  it('preserves stable machine-readable context', () => {
    const error = new GuideShotError('TARGET_NOT_FOUND', 'Target is missing.', {
      recipeId: 'demo.capture',
      jobKey: 'demo.capture::default',
      hint: 'Add data-guide-target.',
    });
    expect(isGuideShotError(error)).toBe(true);
    expect(error.toDiagnostic()).toEqual({
      code: 'TARGET_NOT_FOUND',
      severity: 'error',
      message: 'Target is missing.',
      recipeId: 'demo.capture',
      jobKey: 'demo.capture::default',
      hint: 'Add data-guide-target.',
    });
  });

  it('normalizes unknown failures without leaking stacks', () => {
    expect(
      diagnosticFromUnknown(new Error('socket closed'), 'CAPTURE_FAILED'),
    ).toEqual({
      code: 'CAPTURE_FAILED',
      severity: 'error',
      message: 'socket closed',
    });
  });
});
