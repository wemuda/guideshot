import { GuideShotError, isGuideShotError, type Action } from '@guideshot/core';

import { pollUntil } from './poll.js';
import type { TargetErrorContext, TargetResolver } from './targets.js';

export async function executeActions(
  resolver: TargetResolver,
  actions: readonly Action[],
  timeoutMs: number,
  context: TargetErrorContext,
): Promise<void> {
  for (const action of actions) {
    try {
      await executeAction(resolver, action, timeoutMs, context);
    } catch (cause) {
      if (isGuideShotError(cause)) throw cause;
      throw new GuideShotError(
        'CAPTURE_FAILED',
        `Action "${action.do}" failed${'target' in action ? ` for target "${action.target}"` : ''}.`,
        {
          ...context,
          details: {
            action: action.do,
            ...('target' in action ? { target: action.target } : {}),
          },
          cause,
        },
      );
    }
  }
}

async function executeAction(
  resolver: TargetResolver,
  action: Action,
  timeoutMs: number,
  context: TargetErrorContext,
): Promise<void> {
  switch (action.do) {
    case 'click':
      await (await resolver.unique(action.target, { visible: true })).click();
      return;
    case 'fill':
      await (
        await resolver.unique(action.target, { visible: true })
      ).fill(resolvedText(action.value, 'fill action', context));
      return;
    case 'clear':
      await (await resolver.unique(action.target, { visible: true })).clear();
      return;
    case 'press':
      await (
        await resolver.unique(action.target, { visible: true })
      ).press(action.key);
      return;
    case 'select':
      await (
        await resolver.unique(action.target, { visible: true })
      ).selectOption(action.value);
      return;
    case 'check':
      await (await resolver.unique(action.target, { visible: true })).check();
      return;
    case 'uncheck':
      await (await resolver.unique(action.target, { visible: true })).uncheck();
      return;
    case 'hover':
      await (await resolver.unique(action.target, { visible: true })).hover();
      return;
    case 'focus':
      await (await resolver.unique(action.target, { visible: true })).focus();
      return;
    case 'scroll': {
      const locator = await resolver.unique(action.target, { visible: true });
      const options: ScrollIntoViewOptions = {
        behavior: 'auto',
        block: action.block ?? 'center',
        inline: action.inline ?? 'nearest',
      };
      await locator.evaluate(
        (element, scrollOptions) => element.scrollIntoView(scrollOptions),
        options,
      );
      return;
    }
    case 'upload':
      await (
        await resolver.unique(action.target, { visible: true })
      ).setInputFiles(action.files);
      return;
    case 'drag': {
      const source = await resolver.unique(action.target, { visible: true });
      const destination = await resolver.unique(action.to, { visible: true });
      await source.dragTo(destination);
      return;
    }
    case 'waitFor': {
      const locator = await resolver.unique(action.target);
      if (action.state === 'enabled') {
        const enabled = await pollUntil(() => locator.isEnabled(), timeoutMs);
        if (!enabled) {
          throw new GuideShotError(
            'EXPECTATION_FAILED',
            `Target "${action.target}" did not become enabled.`,
            {
              ...context,
              details: { target: action.target, state: action.state },
            },
          );
        }
      } else {
        await locator.waitFor({ state: action.state, timeout: timeoutMs });
      }
      return;
    }
    case 'invoke':
      throw new GuideShotError(
        'EXTENSION_NOT_REGISTERED',
        `Custom action "${action.use}" must be handled by a project adapter.`,
        { ...context, details: { action: action.use } },
      );
  }
}

function resolvedText(
  value: unknown,
  description: string,
  context: TargetErrorContext,
): string {
  if (typeof value === 'string') return value;
  throw new GuideShotError(
    'VARIABLE_UNRESOLVED',
    `Localized text for ${description} has not been resolved.`,
    context,
  );
}
