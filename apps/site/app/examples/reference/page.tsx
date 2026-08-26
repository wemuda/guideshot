import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Icon } from '@guideshot/ui/components/icon';
import type { Metadata } from 'next';
import Link from 'next/link';

import { RecipeExample } from '@/components/recipe-example';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { createReferenceExamples } from '@/examples/showcase-examples';

export const metadata: Metadata = {
  title: 'Annotation reference',
  description:
    'A compact use-this-when catalog for GuideShot annotations, connectors, and emphasis.',
};

export default async function ExamplesReferencePage() {
  const examples = await createReferenceExamples();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto w-full max-w-[1080px] flex-1 px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <header className="max-w-[760px]">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.1em] text-primary">
            Reference
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[1] tracking-[-0.055em]">
            Use the lightest visual treatment that explains the action.
          </h1>
          <p className="mt-5 max-w-[660px] text-lg leading-8 text-text-secondary">
            Compare annotation primitives, connector anchors, and emphasis
            treatments against the same stable product surface.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/examples">
              <Icon data-icon="inline-start" icon={ArrowLeft02Icon} />
              Back to example stories
            </Link>
          </Button>
        </header>

        <div className="mt-12">
          {examples.map((example) => (
            <RecipeExample example={example} key={example.id} />
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
