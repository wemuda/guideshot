'use client';

import {
  ExternalLinkIcon,
  Moon02Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Icon } from '@guideshot/ui/components/icon';
import { useTheme } from '@guideshot/ui/components/theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@guideshot/ui/components/tooltip';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { useHydrated } from '@/hooks/use-hydrated';

export function SiteHeader({
  showThemeToggle = true,
}: {
  showThemeToggle?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const dark = hydrated && resolvedTheme === 'dark';

  return (
    <header className="border-b border-separator bg-background/95">
      <div className="mx-auto flex h-20 w-full max-w-[1536px] items-center justify-between px-5 sm:px-8 lg:px-[54px]">
        <Brand />
        <nav
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Main navigation"
        >
          <Button asChild size="sm" variant="ghost">
            <Link href="/docs">Docs</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/examples">Examples</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <a
              aria-label="GuideShot on GitHub"
              href="https://github.com/wemuda/guideshot"
              rel="noreferrer"
              target="_blank"
            >
              <span className="hidden sm:inline">GitHub</span>
              <Icon icon={ExternalLinkIcon} size={12} />
            </a>
          </Button>
          {showThemeToggle ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={dark ? 'Use light theme' : 'Use dark theme'}
                  onClick={() => setTheme(dark ? 'light' : 'dark')}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Icon icon={dark ? Sun03Icon : Moon02Icon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {dark ? 'Use light theme' : 'Use dark theme'}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
