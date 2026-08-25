import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const navigation = [
  ['get-started', 'Get started'],
  ['recipe-anatomy', 'Recipe anatomy'],
  ['scenarios', 'Scenarios and authentication'],
  ['targets', 'Stable targets'],
  ['pipeline', 'Capture and composition'],
  ['cli', 'CLI'],
  ['security', 'Security'],
] as const;

const recipe = `{
  "version": 1,
  "id": "pilot.recipes.create",
  "profile": "guide.desktop",
  "scenario": { "use": "pilot:authenticated" },
  "page": { "path": "/demo/recipes" },
  "matrix": {
    "locale": ["en", "da", "nb"],
    "theme": ["light", "dark"]
  },
  "prepare": [
    { "do": "click", "target": "recipes.create" },
    {
      "do": "fill",
      "target": "recipe.name",
      "value": "Invite a teammate"
    }
  ],
  "ready": [
    { "expect": "visible", "target": "recipe.form" },
    { "expect": "hidden", "target": "app.loading" }
  ],
  "capture": {
    "frame": {
      "around": ["recipe.form"],
      "padding": 40,
      "aspectRatio": "4:3",
      "fit": "expand"
    }
  },
  "annotations": [{
    "id": "recipe-name",
    "kind": "callout",
    "target": "recipe.name",
    "content": "Give the recipe a stable name."
  }],
  "accessibility": {
    "alt": "The new recipe form with its name field highlighted."
  },
  "output": { "formats": ["webp"] }
}`;

const config = `import { defineConfig } from '@guideshot/core'
import { playwrightDriver } from '@guideshot/playwright'
import { htmlRenderer } from '@guideshot/renderer'

export default defineConfig({
  recipes: ['shots/**/*.shot.json'],
  outputDir: 'generated/guideshot',
  cacheDir: '.guideshot/cache',
  server: { url: 'http://localhost:3000' },
  safety: { allowedOrigins: ['http://localhost:3000'] },
  driver: playwrightDriver(),
  renderer: htmlRenderer(),
  profiles: {
    'guide.desktop': {
      viewport: { width: 1280, height: 960 },
      pixelRatio: 1
    }
  },
  dimensions: {},
  scenarios: {}
})`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-5 overflow-x-auto rounded-xl border border-white/5 bg-[#0f1218] p-5 text-[12px] leading-6 text-[#e8e6df] sm:text-[13px]">
      <code>{children}</code>
    </pre>
  );
}

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-8 py-12 first:pt-0" id={id}>
      <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h2>
      <div className="mt-5 space-y-5 text-[15px] leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Badge variant="primary">Documentation</Badge>
          <h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
            From recipe to reviewable artifact.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Recipes describe reproducible visual intent. Project adapters create
            the application state.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[230px_minmax(0,760px)] lg:gap-20 lg:py-20">
        <aside className="hidden lg:block">
          <nav className="sticky top-8 space-y-1" aria-label="Documentation sections">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              On this page
            </p>
            {navigation.map(([id, label]) => (
              <a
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                href={`#${id}`}
                key={id}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <article>
          <DocSection id="get-started" title="Get started">
            <p>
              GuideShot keeps capture explicit. Your application starts normally;
              the CLI plans recipes, prepares isolated state, captures Chromium,
              and publishes only after every requested variant succeeds.
            </p>
            <ol className="grid gap-3 text-foreground">
              {[
                'Install the workspace packages and Chromium.',
                'Add a typed guideshot.config.ts.',
                'Create one strict .shot.json recipe.',
                'Mark durable UI targets with data-guide-target.',
                'Validate, inspect the plan, then capture.',
                'Consume generated/guideshot/manifest.json.',
              ].map((step, index) => (
                <li className="flex gap-3" key={step}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <CodeBlock>{`pnpm add -D @guideshot/cli @guideshot/playwright @guideshot/renderer
pnpm exec playwright install chromium
pnpm exec guideshot validate
pnpm exec guideshot plan
pnpm exec guideshot capture`}</CodeBlock>
            <CodeBlock>{config}</CodeBlock>
          </DocSection>

          <Separator />
          <DocSection id="recipe-anatomy" title="Recipe anatomy">
            <p>
              A recipe names the intended application state and every visual
              variant that should exist. It contains data—not callbacks, secrets,
              or arbitrary JavaScript.
            </p>
            <CodeBlock>{recipe}</CodeBlock>
            <p>
              Matrix dimensions expand deterministically. Profile and adapter
              versions feed the capture identity, while annotation copy and theme
              feed a separate composition identity.
            </p>
          </DocSection>

          <Separator />
          <DocSection id="scenarios" title="Scenarios and authentication">
            <p>
              Scenarios are reviewed TypeScript. They can seed data, create a
              synthetic session, set feature flags, and return safe variables for
              interpolation. Every capture receives a fresh browser context.
            </p>
            <CodeBlock>{`const authenticatedPilot = defineScenario({
  version: '1',
  async prepare() {
    return {
      variables: { exampleName: 'Invite a teammate' },
      browser: {
        localStorage: [{
          origin: 'http://localhost:3000',
          values: {
            'guideshot:demo-session': JSON.stringify({
              version: 1,
              userId: 'demo-admin'
            })
          }
        }]
      }
    }
  }
})`}</CodeBlock>
            <Alert>
              <AlertTriangle className="mb-2 size-4 text-primary" />
              <AlertTitle>Keep recipes portable</AlertTitle>
              <AlertDescription>
                Never put credentials or arbitrary JavaScript in a recipe.
              </AlertDescription>
            </Alert>
          </DocSection>

          <Separator />
          <DocSection id="targets" title="Stable targets">
            <p>
              Attach GuideShot to semantic application identity. Every referenced
              target must resolve to exactly one visible element unless an
              expectation explicitly checks absence or hidden state.
            </p>
            <CodeBlock>{`<Button data-guide-target="recipes.create">
  New recipe
</Button>`}</CodeBlock>
            <p>
              Translated labels remain free to change. Layout can reflow across
              locales and viewports, and the annotation follows the element.
            </p>
          </DocSection>

          <Separator />
          <DocSection id="pipeline" title="Capture and composition">
            <p>
              The browser driver captures a clean, privacy-sanitized scene and
              target geometry. A network-blocked compositor adds callouts,
              connectors, spotlights, and outlines afterward.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Capture cache', 'Page state, targets, frame, and sanitized pixels.'],
                ['Composition cache', 'Annotation copy, placement, theme, and output.'],
              ].map(([title, copy]) => (
                <div className="rounded-xl border border-border bg-card p-5" key={title}>
                  <strong className="text-foreground">{title}</strong>
                  <p className="mt-2 text-sm leading-6">{copy}</p>
                </div>
              ))}
            </div>
            <p className="flex items-start gap-2 text-foreground">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
              Annotation-only changes recompose without reopening the application.
            </p>
          </DocSection>

          <Separator />
          <DocSection id="cli" title="CLI">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Command</TableHead>
                  <TableHead>Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ['validate', 'Validate config, recipes, references, and outputs.'],
                  ['plan', 'Print the job matrix and cache identities.'],
                  ['capture', 'Prepare, capture, compose, and publish atomically.'],
                  ['compose', 'Re-render valid cached scenes without the app.'],
                  ['verify', 'Check the manifest, hashes, files, and alt text.'],
                ].map(([command, purpose]) => (
                  <TableRow key={command}>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                        guideshot {command}
                      </code>
                    </TableCell>
                    <TableCell>{purpose}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p>
              Add <code className="text-foreground">--json</code> for stable
              machine-readable diagnostics in CI.
            </p>
          </DocSection>

          <Separator />
          <DocSection id="security" title="Security">
            <p>
              GuideShot refuses non-loopback origins unless explicitly allowed,
              blocks unsupported protocols, escapes annotation text, and keeps
              session state out of public artifacts.
            </p>
            <ul className="space-y-3 text-foreground">
              {[
                'Mask sensitive regions before a raw scene can be persisted.',
                'Use ephemeral documentation tenants or deterministic mocks.',
                'Keep traces and detailed provenance in private run reports.',
                'Review recipes as trusted repository code.',
              ].map((item) => (
                <li className="flex gap-3" key={item}>
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </DocSection>

          <div className="mt-6 rounded-2xl bg-foreground p-6 text-background sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              See the contracts in motion.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-background/65">
              The pilot app is deliberately deterministic and carries stable
              targets for every documented interaction.
            </p>
            <Button asChild className="mt-6 bg-background text-foreground hover:bg-background/85">
              <Link href="/demo">
                Open GuideShot Studio
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}
