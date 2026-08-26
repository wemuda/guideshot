'use client';

import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Globe02Icon,
  Moon02Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Card, CardContent, CardFooter } from '@guideshot/ui/components/card';
import { Icon } from '@guideshot/ui/components/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@guideshot/ui/components/select';
import { ErrorState } from '@guideshot/ui/components/state';
import { useTheme } from '@guideshot/ui/components/theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@guideshot/ui/components/tooltip';
import Image from 'next/image';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { useHydrated } from '@/hooks/use-hydrated';
import manifestJson from '@/public/generated/guideshot/manifest.json';
import {
  isReleaseGuideLocale,
  isReleaseGuideTheme,
  normalizeGeneratedManifest,
  releaseGuideCopy,
  releaseGuideLocales,
  selectReleaseGuideSlides,
  type ReleaseGuideLocale,
} from '@/lib/generated-guide';

const generatedManifest = normalizeGeneratedManifest(manifestJson);
const localeEvent = 'guideshot:locale-change';

const localeLabels: Record<ReleaseGuideLocale, string> = {
  en: 'EN',
  da: 'DA',
  nb: 'NB',
};

function slideOffset(index: number, activeIndex: number) {
  return index - activeIndex;
}

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(localeEvent, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(localeEvent, onStoreChange);
  };
}

function getStoredLocale(): ReleaseGuideLocale {
  const storedLocale = localStorage.getItem('guideshot:locale');
  return isReleaseGuideLocale(storedLocale) ? storedLocale : 'en';
}

export function GuideCarousel() {
  const { resolvedTheme, setTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const hydrated = useHydrated();
  const locale = useSyncExternalStore<ReleaseGuideLocale>(
    subscribeToLocale,
    getStoredLocale,
    () => 'en',
  );
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const theme =
    hydrated && isReleaseGuideTheme(resolvedTheme) ? resolvedTheme : 'light';
  const selection = useMemo(
    () => selectReleaseGuideSlides(generatedManifest, locale, theme),
    [locale, theme],
  );
  const copy = releaseGuideCopy[locale];
  const activeSlide = selection.slides[activeIndex];

  function selectLocale(value: string) {
    if (!isReleaseGuideLocale(value)) return;
    localStorage.setItem('guideshot:locale', value);
    window.dispatchEvent(new Event(localeEvent));
  }

  function move(delta: number) {
    setActiveIndex((current) => Math.max(0, Math.min(2, current + delta)));
  }

  if (selection.missingEntryIds.length > 0 || activeSlide === undefined) {
    return (
      <ErrorState
        className="min-h-72 border-y border-separator"
        description={`Run GuideShot capture to publish ${selection.variantKey}.`}
        icon={<Icon icon={Alert02Icon} size={20} />}
        title="This guide variant has not been generated"
      />
    );
  }

  return (
    <section
      aria-labelledby="guide-title"
      className="w-full min-w-0 max-w-[470px] scroll-mt-6 lg:justify-self-end"
      id="guide"
    >
      <div className="mb-2.5 flex items-end justify-between gap-4">
        <div>
          <p className="text-card-title font-semibold">{copy.guideLabel}</p>
          <h2 className="mt-1 text-body text-text-secondary" id="guide-title">
            {copy.guideTitle}
          </h2>
        </div>

        <div
          aria-label="Guide preferences"
          className="flex items-center gap-1"
          role="toolbar"
        >
          <Select onValueChange={selectLocale} value={locale}>
            <SelectTrigger
              aria-label={copy.language}
              className="h-9 w-[78px] font-mono text-caption"
            >
              <Icon icon={Globe02Icon} size={12} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {releaseGuideLocales.map((value) => (
                <SelectItem key={value} value={value}>
                  {localeLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={
                  theme === 'dark' ? 'Use light theme' : 'Use dark theme'
                }
                disabled={!hydrated}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                size="icon-lg"
                type="button"
                variant="ghost"
              >
                <Icon icon={theme === 'dark' ? Sun03Icon : Moon02Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <p className="mb-3 max-w-[420px] text-caption leading-5 text-text-meta">
        Generated by GuideShot. Switch language or theme to inspect another
        published variant.
      </p>

      <Card className="gap-0 py-0">
        <div
          aria-label={`${activeIndex + 1} / 3: ${copy.steps[activeSlide.id]}`}
          className="relative aspect-[4/3] overflow-hidden bg-surface-subtle outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') move(-1);
            if (event.key === 'ArrowRight') move(1);
          }}
          onTouchEnd={(event) => {
            if (touchStart === null) return;
            const distance = event.changedTouches[0]?.clientX ?? touchStart;
            if (Math.abs(distance - touchStart) > 48) {
              move(distance < touchStart ? 1 : -1);
            }
            setTouchStart(null);
          }}
          onTouchStart={(event) =>
            setTouchStart(event.touches[0]?.clientX ?? null)
          }
          role="group"
          tabIndex={0}
        >
          {selection.slides.map((slide, index) => {
            const offset = slideOffset(index, activeIndex);
            const active = offset === 0;
            return (
              <div
                aria-hidden={!active}
                className={`absolute inset-0 transition-[opacity,translate] duration-300 ease-disclosure motion-reduce:transition-none ${
                  active
                    ? 'z-10 translate-x-0 opacity-100'
                    : offset < 0
                      ? '-translate-x-[10%] opacity-0'
                      : 'translate-x-[10%] opacity-0'
                }`}
                key={slide.id}
              >
                <Image
                  alt={active ? slide.alt : ''}
                  className="h-full w-full object-contain"
                  height={slide.height}
                  priority={index === 0}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  src={slide.src}
                  width={slide.width}
                />
              </div>
            );
          })}
        </div>

        <CardContent
          aria-live="polite"
          className="grid gap-2.5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
        >
          <div>
            <p className="font-mono text-eyebrow text-text-meta">
              {activeIndex + 1} / 3
            </p>
            <h3 className="mt-1 text-title font-semibold tracking-title">
              {copy.steps[activeSlide.id]}
            </h3>
            <p className="mt-1 max-w-prose text-control leading-relaxed text-text-secondary">
              {copy.descriptions[activeSlide.id]}
            </p>
          </div>

          <ol className="space-y-1.5 self-center">
            {copy.instructions[activeSlide.id].map((instruction, index) => (
              <li className="flex items-center gap-3" key={instruction}>
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-control-border font-mono text-eyebrow text-text-secondary">
                  {index + 1}
                </span>
                <span className="text-control font-medium">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t py-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={copy.previous}
                disabled={activeIndex === 0}
                onClick={() => move(-1)}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <Icon icon={ArrowLeft02Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copy.previous}</TooltipContent>
          </Tooltip>

          <div aria-label="Guide steps" className="flex items-center gap-1">
            {selection.slides.map((slide, index) => (
              <button
                aria-current={index === activeIndex ? 'step' : undefined}
                aria-label={`Show ${copy.steps[slide.id]}`}
                className="grid size-8 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                key={slide.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span
                  className={`rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none ${
                    index === activeIndex
                      ? 'h-1.5 w-5 bg-primary'
                      : 'size-1.5 bg-separator-glyph'
                  }`}
                />
              </button>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={copy.next}
                disabled={activeIndex === 2}
                onClick={() => move(1)}
                size="icon-sm"
                type="button"
              >
                <Icon icon={ArrowRight02Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copy.next}</TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </section>
  );
}
