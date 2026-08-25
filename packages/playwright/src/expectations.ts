import {
  GuideShotError,
  isGuideShotError,
  type Expectation,
} from '@guideshot/core';
import type { Page } from 'playwright';

import { pollUntil } from './poll.js';
import type { TargetErrorContext, TargetResolver } from './targets.js';

export async function verifyExpectations(
  page: Page,
  resolver: TargetResolver,
  expectations: readonly Expectation[],
  timeoutMs: number,
  context: TargetErrorContext,
): Promise<void> {
  for (const expectation of expectations) {
    try {
      await verifyExpectation(page, resolver, expectation, timeoutMs, context);
    } catch (cause) {
      if (isGuideShotError(cause)) throw cause;
      throw expectationError(expectation, context, cause);
    }
  }
}

async function verifyExpectation(
  page: Page,
  resolver: TargetResolver,
  expectation: Expectation,
  timeoutMs: number,
  context: TargetErrorContext,
): Promise<void> {
  switch (expectation.expect) {
    case 'visible':
      await resolver.unique(expectation.target, { visible: true });
      return;
    case 'hidden': {
      const locator = await resolver.unique(expectation.target);
      await requirePoll(
        () => locator.isHidden(),
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'absent':
      await requirePoll(
        async () => (await resolver.locator(expectation.target).count()) === 0,
        timeoutMs,
        expectation,
        context,
      );
      return;
    case 'enabled': {
      const locator = await resolver.unique(expectation.target);
      await requirePoll(
        () => locator.isEnabled(),
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'disabled': {
      const locator = await resolver.unique(expectation.target);
      await requirePoll(
        () => locator.isDisabled(),
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'checked': {
      const locator = await resolver.unique(expectation.target);
      await requirePoll(
        () => locator.isChecked(),
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'editable': {
      const locator = await resolver.unique(expectation.target);
      await requirePoll(
        () => locator.isEditable(),
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'text': {
      const locator = await resolver.unique(expectation.target);
      const expected = resolvedText(expectation.value, expectation, context);
      await requirePoll(
        async () =>
          normalizeText(await locator.textContent()) ===
          normalizeText(expected),
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'value': {
      const locator = await resolver.unique(expectation.target);
      const expected = resolvedText(expectation.value, expectation, context);
      await requirePoll(
        async () => (await locator.inputValue()) === expected,
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'attribute': {
      const locator = await resolver.unique(expectation.target);
      await requirePoll(
        async () =>
          (await locator.getAttribute(expectation.name)) === expectation.value,
        timeoutMs,
        expectation,
        context,
      );
      return;
    }
    case 'count':
      await requirePoll(
        async () =>
          (await resolver.locator(expectation.target).count()) ===
          expectation.count,
        timeoutMs,
        expectation,
        context,
      );
      return;
    case 'url':
      await requirePoll(
        () => page.url() === expectation.value,
        timeoutMs,
        expectation,
        context,
      );
      return;
    case 'route':
      await requirePoll(
        () => routeOf(page.url()) === expectation.path,
        timeoutMs,
        expectation,
        context,
      );
      return;
  }
}

async function requirePoll(
  predicate: () => boolean | Promise<boolean>,
  timeoutMs: number,
  expectation: Expectation,
  context: TargetErrorContext,
): Promise<void> {
  if (!(await pollUntil(() => safePredicate(predicate), timeoutMs))) {
    throw expectationError(expectation, context);
  }
}

async function safePredicate(
  predicate: () => boolean | Promise<boolean>,
): Promise<boolean> {
  try {
    return await predicate();
  } catch {
    return false;
  }
}

function expectationError(
  expectation: Expectation,
  context: TargetErrorContext,
  cause?: unknown,
): GuideShotError {
  const target = 'target' in expectation ? expectation.target : undefined;
  return new GuideShotError(
    'EXPECTATION_FAILED',
    `Expectation "${expectation.expect}" failed${target === undefined ? '' : ` for target "${target}"`}.`,
    {
      ...context,
      details: {
        expectation: expectation.expect,
        ...(target === undefined ? {} : { target }),
      },
      ...(cause === undefined ? {} : { cause }),
    },
  );
}

function resolvedText(
  value: unknown,
  expectation: Expectation,
  context: TargetErrorContext,
): string {
  if (typeof value === 'string') return value;
  throw new GuideShotError(
    'VARIABLE_UNRESOLVED',
    `Localized text for expectation "${expectation.expect}" has not been resolved.`,
    context,
  );
}

function normalizeText(value: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function routeOf(value: string): string {
  const url = new URL(value);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function allowsMultipleTargets(expectation: Expectation): boolean {
  return expectation.expect === 'count';
}
