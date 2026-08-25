'use client';

import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import manifestJson from '@/public/generated/guideshot/manifest.json';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  demoCopy,
  demoGuideCopy,
  type DemoLocale,
  type DemoTheme,
} from '@/lib/demo';
import {
  DEMO_GUIDE_ENTRY_IDS,
  selectDemoGuideSlides,
} from '@/lib/generated-guide';

interface DemoHelpProps {
  readonly locale: DemoLocale;
  readonly theme: DemoTheme;
}

export function DemoHelp({ locale, theme }: DemoHelpProps) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const copy = demoCopy[locale];
  const guideCopy = demoGuideCopy[locale];
  const selection = selectDemoGuideSlides(manifestJson, locale, theme);
  const slides = selection.slides;
  const guideReady =
    selection.missingEntryIds.length === 0 &&
    slides.length === DEMO_GUIDE_ENTRY_IDS.length;
  const slide = guideReady ? slides[stepIndex] : undefined;

  useEffect(() => setStepIndex(0), [locale, theme]);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setStepIndex(0);
  }

  function previous() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function next() {
    if (!guideReady) return;
    setStepIndex((current) => Math.min(slides.length - 1, current + 1));
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-5 right-5 z-40 h-14 bg-amber-300 px-6 text-base font-black text-slate-950 shadow-[0_14px_40px_-12px_rgba(245,158,11,0.85)] hover:bg-amber-200 focus-visible:ring-amber-400 sm:bottom-7 sm:right-7"
          data-guide-product-help
          data-guide-target="help.open"
          type="button"
        >
          <CircleHelp className="size-5" />
          {copy.help}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="h-[calc(100dvh-1rem)] max-h-[860px] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden p-4 sm:h-[min(90vh,860px)] sm:p-6"
        closeLabel={copy.close}
        data-guide-target="help.carousel"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') previous();
          if (event.key === 'ArrowRight') next();
        }}
      >
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              <Sparkles className="mr-1 size-3" />
              {locale.toUpperCase()} · {theme}
            </Badge>
            {guideReady && (
              <span
                aria-live="polite"
                className="text-xs font-semibold text-muted-foreground"
              >
                {copy.step} {stepIndex + 1} / {slides.length}
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl sm:text-3xl">
            {copy.helpTitle}
          </DialogTitle>
          <DialogDescription>{copy.helpDescription}</DialogDescription>
        </DialogHeader>

        {slide === undefined ? (
          <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <div>
              <CircleHelp className="mx-auto size-8 text-primary" />
              <p className="mt-4 font-semibold">{copy.helpUnavailable}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/45 p-1.5 sm:p-2">
              <a
                aria-label={copy.openFullSize}
                className="flex h-full min-h-0 w-full items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href={slide.src}
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt={slide.alt}
                  className="max-h-full w-auto max-w-full rounded-xl object-contain"
                  height={slide.height}
                  src={slide.src}
                  width={slide.width}
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
                  <Maximize2 className="size-3" />
                  {copy.openFullSize}
                </span>
              </a>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div aria-live="polite" className="min-w-0">
                <p className="text-lg font-semibold tracking-[-0.025em]">
                  {guideCopy[slide.id].title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {guideCopy[slide.id].description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  aria-label={copy.previous}
                  disabled={stepIndex === 0}
                  onClick={previous}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <ArrowLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1.5 px-1">
                  {slides.map((candidate, index) => (
                    <button
                      aria-label={`${copy.step} ${index + 1}`}
                      aria-current={index === stepIndex ? 'step' : undefined}
                      className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      key={candidate.id}
                      onClick={() => setStepIndex(index)}
                      type="button"
                    >
                      <span
                        className={`size-2.5 rounded-full transition-colors ${
                          index === stepIndex ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {stepIndex === slides.length - 1 ? (
                  <Button onClick={() => changeOpen(false)} type="button">
                    {copy.done}
                  </Button>
                ) : (
                  <Button onClick={next} type="button">
                    {copy.next}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
