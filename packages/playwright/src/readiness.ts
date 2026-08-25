import { GuideShotError, type Rect } from '@guideshot/core';
import type { Page } from 'playwright';

import { delay } from './poll.js';
import type {
  MeasuredTarget,
  TargetErrorContext,
  TargetResolver,
} from './targets.js';

const CAPTURE_CSS = `
  html { scroll-behavior: auto !important; }
  *, *::before, *::after {
    animation: none !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
    transition: none !important;
  }
`;

export interface StabilityOptions {
  readonly samples: number;
  readonly intervalMs: number;
  readonly tolerance: number;
}

export async function prepareForCapture(
  page: Page,
  timeoutMs: number,
  context: TargetErrorContext,
): Promise<void> {
  await page.addStyleTag({ content: CAPTURE_CSS });
  try {
    await page.waitForFunction(
      () => {
        const fontsReady =
          document.fonts === undefined || document.fonts.status === 'loaded';
        return (
          fontsReady &&
          Array.from(document.images).every((image) => image.complete)
        );
      },
      undefined,
      { timeout: timeoutMs },
    );
    await page.evaluate(async () => {
      if (document.fonts !== undefined) await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map(async (image) => {
          if (typeof image.decode !== 'function') return;
          try {
            await image.decode();
          } catch {
            // Broken images have completed loading and are handled by project diagnostics.
          }
        }),
      );
    });
  } catch (cause) {
    throw new GuideShotError(
      'LAYOUT_UNSTABLE',
      'Fonts or images did not become capture-ready before the timeout.',
      { ...context, cause },
    );
  }
}

export async function sampleStableTargets(
  resolver: TargetResolver,
  allowedMultiple: ReadonlySet<string>,
  options: StabilityOptions,
  context: TargetErrorContext,
): Promise<Readonly<Record<string, MeasuredTarget>>> {
  const samples = Math.max(2, options.samples);
  let previous = await resolver.measureAll(allowedMultiple);
  for (let index = 1; index < samples; index += 1) {
    await delay(options.intervalMs);
    const current = await resolver.measureAll(allowedMultiple);
    const unstable = firstDifference(previous, current, options.tolerance);
    if (unstable !== undefined) {
      throw new GuideShotError(
        'LAYOUT_UNSTABLE',
        `Target geometry did not stabilize for "${unstable}".`,
        {
          ...context,
          details: {
            target: unstable,
            samples,
            intervalMs: options.intervalMs,
            tolerance: options.tolerance,
          },
        },
      );
    }
    previous = current;
  }
  return previous;
}

export function requireVisibleTargets(
  measurements: Readonly<Record<string, MeasuredTarget>>,
  targets: readonly string[],
  resolver: TargetResolver,
  context: TargetErrorContext,
): void {
  for (const target of targets) {
    const measurement = measurements[target];
    if (measurement === undefined) throw resolver.missing(target);
    if (!measurement.visible) {
      throw new GuideShotError(
        'TARGET_NOT_VISIBLE',
        `Target "${target}" is not visible.`,
        { ...context, details: { target } },
      );
    }
  }
}

function firstDifference(
  left: Readonly<Record<string, MeasuredTarget>>,
  right: Readonly<Record<string, MeasuredTarget>>,
  tolerance: number,
): string | undefined {
  const ids = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const id of [...ids].sort(compareStrings)) {
    const before = left[id];
    const after = right[id];
    if (
      before === undefined ||
      after === undefined ||
      before.visible !== after.visible ||
      rectDifference(before.rect, after.rect) > tolerance
    ) {
      return id;
    }
  }
  return undefined;
}

function rectDifference(left: Rect, right: Rect): number {
  return Math.max(
    Math.abs(left.x - right.x),
    Math.abs(left.y - right.y),
    Math.abs(left.width - right.width),
    Math.abs(left.height - right.height),
  );
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
