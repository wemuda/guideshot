import { Button } from '@guideshot/ui/components/button';
import Link from 'next/link';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { docsNavigation } from '@/lib/docs-navigation';

export function DocsShell({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-[1180px] flex-1 gap-8 px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[180px_minmax(0,780px)] lg:gap-20">
        <aside className="min-w-0">
          <nav
            aria-label="Documentation"
            className="flex max-w-full gap-1 overflow-x-auto pb-2 lg:sticky lg:top-8 lg:grid lg:overflow-visible lg:pb-0"
          >
            <p className="mb-2 hidden text-eyebrow font-semibold uppercase tracking-[0.1em] text-text-meta lg:block">
              Documentation
            </p>
            {docsNavigation.map((item) => (
              <Button
                asChild
                className="shrink-0 justify-start"
                key={item.href}
                size="sm"
                variant="ghost"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      <SiteFooter />
    </main>
  );
}
