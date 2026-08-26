import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Card, CardContent } from '@guideshot/ui/components/card';
import { Icon } from '@guideshot/ui/components/icon';
import type { Metadata } from 'next';
import Link from 'next/link';

import { RecipeExample } from '@/components/recipe-example';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { createLocalizationThemesExample } from '@/examples/localization-themes-example';
import { createStoryShowcaseExamples } from '@/examples/showcase-examples';

export const metadata: Metadata = {
  title: 'Examples',
  description:
    'See how GuideShot handles connected flows, devices, prepared state, framing, matrices, privacy, loading, and diagnostics.',
};

export default async function ExamplesPage() {
  const [connectedRelease, showcaseExamples] = await Promise.all([
    createLocalizationThemesExample(),
    createStoryShowcaseExamples(),
  ]);
  const examples = [connectedRelease, ...showcaseExamples];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto w-full max-w-[1080px] flex-1 px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <header className="max-w-[760px]">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.1em] text-primary">
            Examples
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[1] tracking-[-0.055em]">
            Start with the story you need to publish.
          </h1>
          <p className="mt-5 max-w-[660px] text-lg leading-8 text-text-secondary">
            Each example begins with the visible result, explains what GuideShot
            proves, and lets you inspect the exact recipes that generated it.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/examples/reference">
              Open annotation reference
              <Icon data-icon="inline-end" icon={ArrowRight02Icon} />
            </Link>
          </Button>
        </header>

        <nav
          aria-label="Example stories"
          className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {examples.map((example, index) => (
            <a className="group" href={`#${example.id}`} key={example.id}>
              <Card
                className="h-full transition-colors group-hover:border-control-border"
                size="sm"
              >
                <CardContent className="pt-4">
                  <p className="font-mono text-caption text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-card-title font-semibold">
                    {example.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-body leading-6 text-text-secondary">
                    {example.context}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </nav>

        <div className="mt-10">
          {examples.map((example) => (
            <RecipeExample example={example} key={example.id} />
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
