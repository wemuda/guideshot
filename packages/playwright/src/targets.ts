import { GuideShotError, type Rect, type SceneTarget } from '@guideshot/core';
import type { Locator, Page } from 'playwright';

export interface TargetErrorContext {
  readonly recipeId: string;
  readonly jobKey: string;
}

export interface MeasuredTarget extends SceneTarget {
  readonly rect: Rect;
}

export class TargetResolver {
  readonly #page: Page;
  readonly #attribute: string;
  readonly #timeoutMs: number;
  readonly #context: TargetErrorContext;

  constructor(
    page: Page,
    attribute: string,
    timeoutMs: number,
    context: TargetErrorContext,
  ) {
    assertTargetAttribute(attribute);
    this.#page = page;
    this.#attribute = attribute;
    this.#timeoutMs = timeoutMs;
    this.#context = context;
  }

  locator(target: string): Locator {
    return this.#page.locator(`[${this.#attribute}=${JSON.stringify(target)}]`);
  }

  allLocator(): Locator {
    return this.#page.locator(`[${this.#attribute}]`);
  }

  privacyLocator(): Locator {
    return this.#page.locator(`[${this.#attribute}^="privacy."]`);
  }

  async unique(
    target: string,
    options: { readonly visible?: boolean; readonly wait?: boolean } = {},
  ): Promise<Locator> {
    const locator = this.locator(target);
    if (options.wait !== false) {
      try {
        await locator
          .first()
          .waitFor({ state: 'attached', timeout: this.#timeoutMs });
      } catch (cause) {
        throw this.missing(target, cause);
      }
    }

    const count = await locator.count();
    if (count === 0) throw this.missing(target);
    if (count !== 1) {
      throw new GuideShotError(
        'TARGET_NOT_UNIQUE',
        `Target "${target}" resolved to ${count} elements; expected exactly one.`,
        {
          ...this.#context,
          details: { target, count },
        },
      );
    }

    if (options.visible === true) {
      try {
        await locator.waitFor({ state: 'visible', timeout: this.#timeoutMs });
      } catch (cause) {
        throw new GuideShotError(
          'TARGET_NOT_VISIBLE',
          `Target "${target}" is not visible.`,
          {
            ...this.#context,
            details: { target },
            cause,
          },
        );
      }
    }
    return locator;
  }

  missing(target: string, cause?: unknown): GuideShotError {
    return new GuideShotError(
      'TARGET_NOT_FOUND',
      `Target "${target}" was not found.`,
      {
        ...this.#context,
        details: { target },
        ...(cause === undefined ? {} : { cause }),
      },
    );
  }

  async measureAll(
    allowedMultiple: ReadonlySet<string> = new Set(),
  ): Promise<Readonly<Record<string, MeasuredTarget>>> {
    const measurements = await this.allLocator().evaluateAll(
      (elements, attribute) =>
        elements.map((element) => {
          const id = element.getAttribute(attribute) ?? '';
          const rectangle = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            id,
            rect: {
              x: rectangle.left + window.scrollX,
              y: rectangle.top + window.scrollY,
              width: rectangle.width,
              height: rectangle.height,
            },
            visible:
              rectangle.width > 0 &&
              rectangle.height > 0 &&
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              style.visibility !== 'collapse',
            borderRadius: Number.parseFloat(style.borderTopLeftRadius) || 0,
          };
        }),
      this.#attribute,
    );

    const grouped = new Map<string, typeof measurements>();
    for (const measurement of measurements) {
      if (measurement.id === '') {
        throw new GuideShotError(
          'CAPTURE_FAILED',
          `Every ${this.#attribute} marker must have a non-empty value.`,
          this.#context,
        );
      }
      const group = grouped.get(measurement.id) ?? [];
      group.push(measurement);
      grouped.set(measurement.id, group);
    }

    const result: Record<string, MeasuredTarget> = {};
    for (const [id, group] of grouped) {
      if (group.length !== 1) {
        if (allowedMultiple.has(id)) continue;
        throw new GuideShotError(
          'TARGET_NOT_UNIQUE',
          `Target "${id}" resolved to ${group.length} elements; expected exactly one.`,
          {
            ...this.#context,
            details: { target: id, count: group.length },
          },
        );
      }
      const measurement = group[0];
      if (measurement !== undefined) result[id] = measurement;
    }
    return result;
  }
}

export function assertTargetAttribute(attribute: string): void {
  if (!/^data-[A-Za-z0-9_.:-]+$/.test(attribute)) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      `Invalid target attribute "${attribute}".`,
    );
  }
}
