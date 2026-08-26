import { FocusIcon } from '@hugeicons/core-free-icons';
import { Icon } from '@guideshot/ui/components/icon';
import Link from 'next/link';

export function Brand() {
  return (
    <Link
      aria-label="GuideShot"
      className="inline-flex shrink-0 items-center gap-2.5 rounded-md text-card-title font-semibold tracking-card-title outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href="/"
    >
      <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">
        <Icon icon={FocusIcon} size={16} />
      </span>
      <span className="hidden min-[420px]:inline">GuideShot</span>
    </Link>
  );
}
