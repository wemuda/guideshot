import {
  ArrowRight,
  Braces,
  Check,
  Fingerprint,
  Layers3,
  RefreshCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { CodeSample } from '@/components/code-sample';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sidebarItems = ['Overview', 'Recipes', 'Collections', 'Settings'];

const pipeline = [
  ['01', 'Declare', 'Write portable visual intent.'],
  ['02', 'Prepare', 'Let an adapter create real app state.'],
  ['03', 'Capture', 'Resolve stable targets in Chromium.'],
  ['04', 'Compose', 'Add annotations away from the live page.'],
  ['05', 'Publish', 'Emit assets and a public manifest.'],
] as const;

const principles = [
  {
    icon: ScanSearch,
    title: 'Element-aware',
    copy: 'Frames and callouts follow stable DOM targets, not fragile coordinates.',
  },
  {
    icon: Fingerprint,
    title: 'State-aware',
    copy: 'Typed project scenarios prepare authentication, data, roles, and flags.',
  },
  {
    icon: RefreshCcw,
    title: 'Cache-aware',
    copy: 'Change callout copy and recompose without reopening the application.',
  },
] as const;

function ProductFrame() {
  return (
    <div className="relative mx-auto w-full max-w-[650px] pt-7 lg:mx-0">
      <Badge className="absolute right-2 top-0 z-20 shadow-lg shadow-primary/20" variant="primary">
        deterministic output
      </Badge>
      <div className="overflow-hidden rounded-[22px] border border-foreground/15 bg-card shadow-[0_36px_90px_-46px_rgba(16,20,31,0.55)]">
        <div className="flex h-9 items-center gap-1.5 border-b border-border px-4">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="size-2 rounded-full bg-foreground/45" />
          <span className="size-2 rounded-full bg-foreground/20" />
          <span className="ml-3 h-4 w-2/5 rounded bg-muted" />
        </div>
        <div className="grid min-h-[350px] grid-cols-[112px_1fr] sm:grid-cols-[150px_1fr]">
          <aside className="border-r border-border bg-muted/45 p-4 sm:p-5">
            <div className="mb-7 flex items-center gap-2">
              <span className="size-5 rounded-md bg-foreground" />
              <span className="h-2 w-12 rounded bg-foreground/75" />
            </div>
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <div
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-[9px] font-medium sm:text-[10px] ${
                    index === 1
                      ? 'bg-card text-foreground shadow-sm'
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
            <div className="relative mt-8 rounded-xl border border-border bg-background/65 p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg border border-border bg-card sm:size-16" />
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
              <span className="absolute -right-3 -top-3 grid size-7 place-items-center rounded-full bg-primary text-[11px] font-bold text-white ring-4 ring-card">
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
      <div className="absolute -bottom-4 -left-3 hidden rounded-xl border border-border bg-card px-4 py-3 text-xs font-medium shadow-lg sm:flex sm:items-center sm:gap-3">
        <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
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
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16 lg:pb-32 lg:pt-24">
        <div className="relative z-10">
          <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Portable screenshot automation
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
              <Link href="/docs">
                Read the quickstart
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">Open the pilot</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <span>Open source</span>
            <span>TypeScript</span>
            <span>Playwright</span>
          </div>
        </div>

        <ProductFrame />
      </section>

      <section className="border-y border-border bg-card/35">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border px-5 sm:px-8">
          {[
            ['1', 'recipe'],
            ['6', 'variants'],
            ['0', 'hardcoded coordinates'],
          ].map(([value, label]) => (
            <div className="px-3 py-7 text-center sm:py-9" key={label}>
              <strong className="block text-2xl tracking-[-0.04em] sm:text-3xl">
                {value}
              </strong>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32"
        id="how-it-works"
      >
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div>
            <Badge variant="outline">One deliberate pipeline</Badge>
            <h2 className="mt-5 max-w-md text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Real state in. Durable guidance out.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-muted-foreground">
              The recipe carries visual intent. A typed adapter owns everything
              specific to your application.
            </p>
          </div>
          <div className="border-t border-border">
            {pipeline.map(([number, title, copy]) => (
              <div
                className="grid grid-cols-[42px_100px_1fr] gap-3 border-b border-border py-5 text-sm sm:grid-cols-[56px_140px_1fr] sm:py-6"
                key={number}
              >
                <span className="font-mono text-xs text-primary">{number}</span>
                <strong>{title}</strong>
                <span className="text-muted-foreground">{copy}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="overflow-hidden rounded-3xl border border-border bg-[#fbf7ef] p-3 shadow-sm">
          <Image
            alt="A wireframe application with two numbered annotations and light, dark, desktop, and mobile variants."
            className="h-auto w-full rounded-2xl"
            height={724}
            priority={false}
            src="/guideshot-banner.png"
            width={2172}
          />
        </div>
      </section>

      <section className="border-y border-border bg-card/45 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 max-w-2xl">
            <Badge variant="outline">Designed for change</Badge>
            <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Stable where product interfaces are not.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, copy }) => (
              <Card className="bg-background/70 shadow-none" key={title}>
                <CardHeader>
                  <span className="mb-8 grid size-10 place-items-center rounded-xl border border-border bg-card">
                    <Icon className="size-4.5" />
                  </span>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription>{copy}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <Badge variant="primary">Portable by default</Badge>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Intent stays readable.
          </h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            Recipes are strict JSON. Authentication, data setup, translations,
            and custom behavior live in reviewed TypeScript adapters.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            {[
              [Braces, 'Declarative, schema-validated recipes'],
              [ShieldCheck, 'Conservative privacy and origin defaults'],
              [Layers3, 'Capture and composition cached separately'],
            ].map(([Icon, text]) => (
              <div className="flex items-center gap-3" key={String(text)}>
                <Icon className="size-4 text-primary" />
                <span>{String(text)}</span>
              </div>
            ))}
          </div>
        </div>
        <Card className="overflow-hidden bg-card shadow-none">
          <CardContent className="p-4 sm:p-5">
            <CodeSample />
          </CardContent>
        </Card>
      </section>

      <Separator />
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-14 text-background sm:px-12 sm:py-16">
          <Sparkles className="absolute -right-4 -top-4 size-32 text-primary opacity-70" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-background/55">
              Built to be dogfooded
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Make screenshots part of the product.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-background/65">
              Explore the same deterministic pilot application that GuideShot uses
              to prove its capture pipeline.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-background text-foreground hover:bg-background/85">
                <Link href="/docs">Read the docs</Link>
              </Button>
              <Button
                asChild
                className="border-background/25 bg-transparent text-background hover:bg-background/10"
                variant="outline"
              >
                <Link href="/demo">Explore the demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
