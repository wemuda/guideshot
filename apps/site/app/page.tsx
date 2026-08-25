import { ArrowDownRight, Check, Code2, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';

const sidebarItems = ['Overview', 'Recipes', 'Collections', 'Settings'];

function Mark() {
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-foreground text-sm font-black text-background">
      G
    </span>
  );
}

function ProductFrame() {
  return (
    <div className="relative mx-auto w-full max-w-[650px] pt-7 lg:mx-0">
      <div className="absolute right-2 top-0 z-20 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/20">
        deterministic output
      </div>
      <div className="overflow-hidden rounded-[22px] border border-foreground/15 bg-white shadow-[0_36px_90px_-46px_rgba(16,20,31,0.55)]">
        <div className="flex h-9 items-center gap-1.5 border-b border-border px-4">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="size-2 rounded-full bg-foreground/45" />
          <span className="size-2 rounded-full bg-foreground/20" />
          <span className="ml-3 h-4 w-2/5 rounded bg-secondary" />
        </div>
        <div className="grid min-h-[350px] grid-cols-[112px_1fr] sm:grid-cols-[150px_1fr]">
          <aside className="border-r border-border bg-[#faf9f6] p-4 sm:p-5">
            <div className="mb-7 flex items-center gap-2">
              <span className="size-5 rounded-md bg-foreground" />
              <span className="h-2 w-12 rounded bg-foreground/75" />
            </div>
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <div
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-[9px] font-medium sm:text-[10px] ${
                    index === 1
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                  key={item}
                >
                  <span
                    className={`size-2.5 rounded-full border ${
                      index === 1
                        ? 'border-primary bg-primary'
                        : 'border-foreground/25'
                    }`}
                  />
                  {item}
                </div>
              ))}
            </div>
          </aside>
          <div className="relative p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="h-2 w-14 rounded-full bg-primary/65" />
                <div className="mt-3 h-4 w-32 rounded bg-foreground sm:w-44" />
                <div className="mt-2 h-2 w-28 rounded bg-foreground/20 sm:w-48" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-foreground" />
            </div>
            <div className="relative mt-8 rounded-xl border border-border bg-[#fdfcf9] p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg border border-border bg-white sm:size-16" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-2.5 w-2/3 rounded bg-foreground/80" />
                  <div className="h-2 w-4/5 rounded bg-foreground/20" />
                  <div className="h-2 w-1/2 rounded bg-foreground/20" />
                </div>
                <div className="grid size-7 place-items-center rounded-full bg-primary text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
                {[48, 68, 55].map((width) => (
                  <div className="space-y-2" key={width}>
                    <div className="size-3 rounded-full border border-foreground/35" />
                    <div
                      className="h-1.5 rounded bg-foreground/20"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute -inset-2 rounded-[15px] border-2 border-primary" />
              <span className="absolute -right-3 -top-3 grid size-7 place-items-center rounded-full bg-primary text-[11px] font-bold text-white ring-4 ring-white">
                1
              </span>
            </div>
            <div className="absolute bottom-5 right-5 max-w-[180px] rounded-xl bg-primary p-3 text-[10px] font-medium leading-relaxed text-white shadow-xl shadow-primary/20 sm:max-w-[210px] sm:text-[11px]">
              <span className="mb-1 block font-bold">The recipe stays stable.</span>
              Targets follow the interface, even when its layout changes.
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-3 hidden rounded-xl border border-border bg-white px-4 py-3 text-xs font-medium shadow-lg sm:flex sm:items-center sm:gap-3">
        <span className="grid size-7 place-items-center rounded-full bg-[#e6f7ed] text-[#18794e]">
          <Check className="size-4" />
        </span>
        6 variants captured
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a className="flex items-center gap-3 font-bold tracking-[-0.03em]" href="#top">
          <Mark />
          GuideShot
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Button asChild size="sm" variant="ghost">
            <a href="#how-it-works">How it works</a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <a href="#demo">Demo</a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <a href="#docs">Docs</a>
          </Button>
        </nav>
        <Button asChild size="sm" variant="outline">
          <a href="#docs">
            <Code2 className="size-4" />
            <span className="hidden sm:inline">View source</span>
            <span className="sm:hidden">Source</span>
          </a>
        </Button>
      </header>

      <section
        className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16 lg:pb-32 lg:pt-24"
        id="top"
      >
        <div className="relative z-10">
          <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Screenshots as code
          </p>
          <h1 className="max-w-xl text-balance text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
            Guides that never drift.
          </h1>
          <p className="mt-7 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Turn one declarative recipe into precise, annotated screenshots of
            real product states—across every language, theme, role, and viewport.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#demo">
                Explore the demo
                <ArrowDownRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#docs">
                <Copy className="size-4" />
                pnpm add @guideshot/core
              </a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <span>Framework neutral</span>
            <span>Element anchored</span>
            <span>Privacy first</span>
          </div>
        </div>

        <ProductFrame />
      </section>
    </main>
  );
}
