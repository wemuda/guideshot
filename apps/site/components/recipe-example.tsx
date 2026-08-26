'use client';

import { CodeIcon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@guideshot/ui/components/badge';
import { Button } from '@guideshot/ui/components/button';
import { Card } from '@guideshot/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@guideshot/ui/components/dialog';
import { Icon } from '@guideshot/ui/components/icon';
import { ScrollArea } from '@guideshot/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@guideshot/ui/components/select';
import { ErrorState } from '@guideshot/ui/components/state';
import { Tabs, TabsList, TabsTrigger } from '@guideshot/ui/components/tabs';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';

export interface RecipeExampleVariant {
  readonly alt: string;
  readonly height: number;
  readonly src: string;
  readonly width: number;
}

export interface RecipeExampleStepContent {
  readonly description: string;
  readonly instructions: readonly string[];
  readonly title: string;
}

export interface RecipeExampleStep {
  readonly content: Readonly<Record<string, RecipeExampleStepContent>>;
  readonly id: string;
  readonly variants: Readonly<Record<string, RecipeExampleVariant>>;
}

export interface RecipeExampleProperty {
  readonly control: 'select' | 'tabs';
  readonly defaultValue: string;
  readonly id: string;
  readonly label: string;
  readonly options: readonly {
    readonly label: string;
    readonly value: string;
  }[];
}

export interface RecipeExampleDefinition {
  readonly contentProperty?: string;
  readonly context: string;
  readonly defaultStep?: number;
  readonly description: string;
  readonly changes: string;
  readonly id: string;
  readonly properties: readonly RecipeExampleProperty[];
  readonly proof: string;
  readonly recipes: readonly {
    readonly highlightedSource: string;
    readonly id: string;
    readonly source: unknown;
    readonly title: string;
  }[];
  readonly steps: readonly RecipeExampleStep[];
  readonly title: string;
}

interface RecipeDialogProps {
  readonly example: RecipeExampleDefinition;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement('textarea');
    input.value = value;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}

function RecipeDialog({ example }: RecipeDialogProps) {
  const [activeRecipeId, setActiveRecipeId] = useState(
    example.recipes[0]?.id ?? '',
  );
  const [copied, setCopied] = useState(false);
  const activeRecipe =
    example.recipes.find((recipe) => recipe.id === activeRecipeId) ??
    example.recipes[0];
  const source = activeRecipe
    ? JSON.stringify(activeRecipe.source, null, 2)
    : '';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Icon data-icon="inline-start" icon={CodeIcon} />
          Show recipe
        </Button>
      </DialogTrigger>
      <DialogContent
        className="h-[min(82dvh,760px)] grid-rows-[auto_auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl"
        closeLabel="Close recipe"
      >
        <DialogHeader className="border-b border-separator px-5 py-4 pr-12">
          <DialogTitle>{example.title} recipes</DialogTitle>
          <DialogDescription>
            Review the declarative recipes used to generate this example.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 border-b border-separator px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-full overflow-x-auto">
            <Tabs onValueChange={setActiveRecipeId} value={activeRecipeId}>
              <TabsList aria-label="Example recipes" variant="line">
                {example.recipes.map((recipe) => (
                  <TabsTrigger key={recipe.id} value={recipe.id}>
                    {recipe.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Button
            aria-label={copied ? 'Recipe copied' : 'Copy recipe'}
            onClick={() => {
              void copyText(source).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              });
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            <Icon
              data-icon="inline-start"
              icon={copied ? Tick02Icon : Copy01Icon}
            />
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <ScrollArea className="min-h-0 bg-surface-subtle" fade={false}>
          <div
            className="shiki-code min-w-max"
            dangerouslySetInnerHTML={{
              __html: activeRecipe?.highlightedSource ?? '',
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function createInitialValues(properties: readonly RecipeExampleProperty[]) {
  return Object.fromEntries(
    properties.map((property) => [property.id, property.defaultValue]),
  );
}

function variantKeyFor(
  properties: readonly RecipeExampleProperty[],
  values: Readonly<Record<string, string>>,
) {
  return (
    properties
      .map((property) => `${property.id}=${values[property.id]}`)
      .join(';') || 'default'
  );
}

export function RecipeExample({
  example,
}: {
  readonly example: RecipeExampleDefinition;
}) {
  const [propertyValues, setPropertyValues] = useState(() =>
    createInitialValues(example.properties),
  );
  const [stepIndex, setStepIndex] = useState(example.defaultStep ?? 0);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const variantKey = variantKeyFor(example.properties, propertyValues);
  const step = example.steps[stepIndex];
  const variant = step?.variants[variantKey];
  const contentKey = example.contentProperty
    ? propertyValues[example.contentProperty]
    : 'default';
  const content = contentKey ? step?.content[contentKey] : undefined;
  const titleId = `${example.id}-title`;
  const recipeCountLabel = `${example.recipes.length} ${
    example.recipes.length === 1 ? 'recipe' : 'recipes'
  }`;

  const missingVariant = useMemo(
    () =>
      example.steps.some(
        (exampleStep) => exampleStep.variants[variantKey] === undefined,
      ),
    [example.steps, variantKey],
  );

  function updateProperty(id: string, value: string) {
    setPropertyValues((current) => ({ ...current, [id]: value }));
  }

  function optionAvailable(propertyId: string, value: string) {
    const candidate = variantKeyFor(example.properties, {
      ...propertyValues,
      [propertyId]: value,
    });
    return example.steps.every(
      (exampleStep) => exampleStep.variants[candidate] !== undefined,
    );
  }

  function focusStep(index: number) {
    const nextIndex = Math.max(0, Math.min(example.steps.length - 1, index));
    setStepIndex(nextIndex);
    window.requestAnimationFrame(() => stepRefs.current[nextIndex]?.focus());
  }

  if (missingVariant || step === undefined || variant === undefined) {
    return (
      <ErrorState
        description={`Run GuideShot capture to publish ${variantKey}.`}
        title="This example variant has not been generated"
      />
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className="border-y border-separator py-8"
      id={example.id}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{recipeCountLabel}</Badge>
            {example.properties.length > 0 ? (
              <span className="text-caption text-text-meta">
                {example.properties.length}{' '}
                {example.properties.length === 1 ? 'property' : 'properties'}
              </span>
            ) : null}
          </div>
          <h2
            className="mt-3 text-[1.75rem] font-semibold tracking-[-0.035em]"
            id={titleId}
          >
            {example.title}
          </h2>
          <p className="mt-2 text-body leading-6 text-text-secondary">
            {example.description}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          {example.properties.map((property) => (
            <div className="grid gap-1" key={property.id}>
              <span className="text-eyebrow font-medium text-text-meta">
                {property.label}
              </span>
              {property.control === 'select' ? (
                <Select
                  onValueChange={(value) => updateProperty(property.id, value)}
                  value={propertyValues[property.id]}
                >
                  <SelectTrigger
                    aria-label={`Example ${property.label.toLowerCase()}`}
                    className="w-[170px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {property.options.map((option) => (
                      <SelectItem
                        disabled={!optionAvailable(property.id, option.value)}
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Tabs
                  onValueChange={(value) => updateProperty(property.id, value)}
                  value={propertyValues[property.id]}
                >
                  <TabsList
                    aria-label={`Example ${property.label.toLowerCase()}`}
                  >
                    {property.options.map((option) => (
                      <TabsTrigger
                        disabled={!optionAvailable(property.id, option.value)}
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
          ))}

          <RecipeDialog example={example} />
        </div>
      </div>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-separator bg-separator sm:grid-cols-3">
        {[
          ['What you are seeing', example.context],
          ['What GuideShot proves', example.proof],
          ['What changes', example.changes],
        ].map(([label, value]) => (
          <div className="bg-background p-4" key={label}>
            <dt className="text-eyebrow font-semibold uppercase tracking-[0.08em] text-text-meta">
              {label}
            </dt>
            <dd className="mt-2 text-control leading-6 text-text-secondary">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div
        aria-label="Example steps"
        className="mt-6 flex snap-x gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            focusStep(stepIndex - 1);
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            focusStep(stepIndex + 1);
          }
          if (event.key === 'Home') {
            event.preventDefault();
            focusStep(0);
          }
          if (event.key === 'End') {
            event.preventDefault();
            focusStep(example.steps.length - 1);
          }
        }}
        role="tablist"
      >
        {example.steps.map((exampleStep, index) => {
          const stepContent = contentKey
            ? exampleStep.content[contentKey]
            : undefined;
          const active = stepIndex === index;

          return (
            <Button
              aria-controls={`${example.id}-preview`}
              aria-selected={active}
              className="h-auto min-h-12 min-w-[150px] snap-start justify-start gap-3 px-3 py-2 text-left sm:min-w-0"
              key={exampleStep.id}
              id={`${example.id}-step-${index}`}
              onClick={() => setStepIndex(index)}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={active ? 0 : -1}
              type="button"
              variant={active ? 'secondary' : 'ghost'}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full border border-control-border font-mono text-eyebrow text-text-secondary">
                {index + 1}
              </span>
              <span className="truncate">
                {stepContent?.title ?? exampleStep.id}
              </span>
            </Button>
          );
        })}
      </div>

      <Card
        aria-labelledby={`${example.id}-step-${stepIndex}`}
        className="mt-3 gap-0 overflow-hidden py-0"
        id={`${example.id}-preview`}
        role="tabpanel"
      >
        <div className="grid h-[min(62vh,620px)] min-h-[320px] place-items-center overflow-hidden bg-surface-subtle p-3 [container-type:size] sm:min-h-[380px] sm:p-5">
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-lg border border-card-border bg-background shadow-sm transition-[width,height,aspect-ratio] duration-300 ease-disclosure motion-reduce:transition-none"
            style={{
              aspectRatio: `${variant.width} / ${variant.height}`,
              height: 'auto',
              width: `min(100%, calc(100cqh * ${variant.width / variant.height}))`,
            }}
          >
            {example.steps.map((exampleStep, index) => {
              const item = exampleStep.variants[variantKey];
              if (item === undefined) return null;
              const active = index === stepIndex;

              return (
                <div
                  aria-hidden={!active}
                  className={`absolute inset-0 transition-[opacity,translate] duration-300 ease-disclosure motion-reduce:transition-none ${
                    active
                      ? 'z-10 translate-x-0 opacity-100'
                      : index < stepIndex
                        ? '-translate-x-[8%] opacity-0'
                        : 'translate-x-[8%] opacity-0'
                  }`}
                  key={exampleStep.id}
                >
                  <Image
                    alt={active ? item.alt : ''}
                    className="h-full w-full object-contain"
                    height={item.height}
                    priority={index === (example.defaultStep ?? 0)}
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    src={item.src}
                    width={item.width}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {content && (
          <div
            aria-live="polite"
            className="grid gap-4 border-t border-separator px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
          >
            <div>
              <p className="font-mono text-eyebrow text-text-meta">
                {stepIndex + 1} / {example.steps.length}
              </p>
              <h3 className="mt-1 text-title font-semibold tracking-title">
                {content.title}
              </h3>
              <p className="mt-1 text-control leading-relaxed text-text-secondary">
                {content.description}
              </p>
            </div>
            <ol className="space-y-1.5 self-center">
              {content.instructions.map((instruction, index) => (
                <li className="flex items-center gap-3" key={instruction}>
                  <span className="grid size-5 shrink-0 place-items-center rounded-full border border-control-border font-mono text-eyebrow text-text-secondary">
                    {index + 1}
                  </span>
                  <span className="text-control font-medium">
                    {instruction}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>
    </section>
  );
}
