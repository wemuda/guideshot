import { Code2 } from 'lucide-react';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
      <Brand />
      <nav
        className="hidden items-center gap-1 md:flex"
        aria-label="Main navigation"
      >
        <Button asChild size="sm" variant="ghost">
          <Link href="/#how-it-works">How it works</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/demo">Demo</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/docs">Docs</Link>
        </Button>
      </nav>
      <Button asChild size="sm" variant="outline">
        <a
          href="https://github.com/wemuda/guideshot"
          rel="noreferrer"
          target="_blank"
        >
          <Code2 className="size-4" />
          <span className="hidden sm:inline">View source</span>
          <span className="sm:hidden">Source</span>
        </a>
      </Button>
    </header>
  );
}
