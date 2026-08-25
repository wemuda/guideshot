import Link from 'next/link';

import { cn } from '@/lib/utils';

type BrandProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

export function Brand({ className, compact = false, href = '/' }: BrandProps) {
  return (
    <Link
      className={cn(
        'flex items-center gap-3 font-bold tracking-[-0.03em]',
        className,
      )}
      href={href}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-foreground text-sm font-black text-background">
        G
      </span>
      {!compact && <span>GuideShot</span>}
    </Link>
  );
}
