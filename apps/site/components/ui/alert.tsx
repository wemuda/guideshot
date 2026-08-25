import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative w-full rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm',
        className,
      )}
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-semibold', className)} {...props} />;
}

function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-sm leading-6 text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
