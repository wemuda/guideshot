import { Button } from '@guideshot/ui/components/button';
import Link from 'next/link';

import { CopyCommand } from '@/components/copy-command';
import { GuideCarousel } from '@/components/guide-carousel';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader showThemeToggle={false} />

      <div className="mx-auto w-full max-w-[1408px] flex-1 px-5 sm:px-8 lg:px-12">
        <section className="grid items-center gap-12 py-12 sm:py-14 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[minmax(320px,0.8fr)_minmax(460px,1.2fr)] lg:gap-12 lg:py-8">
          <div className="max-w-[520px] lg:pb-8">
            <h1 className="text-balance text-[clamp(2.4rem,3.4vw,3.3rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
              Screenshots with direction.
            </h1>
            <p className="mt-5 max-w-[500px] text-[clamp(1rem,1.2vw,1.125rem)] leading-7 text-text-secondary">
              GuideShot captures real product states and publishes versioned,
              annotated guides from reviewed recipes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <CopyCommand />
              <Button asChild size="sm" variant="ghost">
                <Link href="/docs/getting-started">Build your first guide</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/examples">Browse examples</Link>
              </Button>
            </div>
          </div>

          <GuideCarousel />
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
