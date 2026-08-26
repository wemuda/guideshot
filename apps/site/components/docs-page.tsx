import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Icon } from '@guideshot/ui/components/icon';
import { Separator } from '@guideshot/ui/components/separator';
import Link from 'next/link';

import { docsNeighbors } from '@/lib/docs-navigation';

export function DocsPage({
  children,
  description,
  href,
  title,
}: {
  readonly children: React.ReactNode;
  readonly description: string;
  readonly href: string;
  readonly title: string;
}) {
  const { previous, next } = docsNeighbors(href);

  return (
    <article>
      <header className="max-w-[720px] pb-10">
        <p className="text-eyebrow font-semibold uppercase tracking-[0.1em] text-primary">
          GuideShot docs
        </p>
        <h1 className="mt-4 text-balance text-[clamp(2.35rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mt-5 max-w-[640px] text-lg leading-8 text-text-secondary">
          {description}
        </p>
      </header>
      <div className="grid gap-10">{children}</div>
      <Separator className="mt-12" />
      <nav
        aria-label="Documentation pagination"
        className="flex items-center justify-between gap-4 py-6"
      >
        {previous ? (
          <Button asChild variant="ghost">
            <Link href={previous.href}>
              <Icon data-icon="inline-start" icon={ArrowLeft02Icon} />
              {previous.label}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="ghost">
            <Link href={next.href}>
              {next.label}
              <Icon data-icon="inline-end" icon={ArrowRight02Icon} />
            </Link>
          </Button>
        ) : null}
      </nav>
    </article>
  );
}

export function DocsSection({
  children,
  description,
  id,
  title,
}: {
  readonly children: React.ReactNode;
  readonly description?: string;
  readonly id?: string;
  readonly title: string;
}) {
  return (
    <section className="scroll-mt-8" id={id}>
      <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.035em]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-body leading-7 text-text-secondary">
          {description}
        </p>
      ) : null}
      <div className="mt-5 grid gap-5 text-body leading-7 text-text-secondary">
        {children}
      </div>
    </section>
  );
}
