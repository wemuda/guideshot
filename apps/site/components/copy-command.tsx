'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Icon } from '@guideshot/ui/components/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@guideshot/ui/components/tooltip';
import { useEffect, useRef, useState } from 'react';

const installCommand = 'pnpm add -D @guideshot/cli';

export function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(installCommand);
    } catch {
      const input = document.createElement('textarea');
      input.value = installCommand;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="inline-flex h-10 max-w-full items-center gap-2 rounded-lg border border-control-border bg-surface px-3 font-mono text-control text-text-secondary">
      <span aria-hidden="true" className="text-text-faint">
        $
      </span>
      <code className="overflow-hidden text-ellipsis whitespace-nowrap">
        {installCommand}
      </code>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={
              copied ? 'Install command copied' : 'Copy install command'
            }
            className="-mr-2 ml-1"
            onClick={() => void copy()}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <Icon icon={copied ? Tick02Icon : Copy01Icon} size={12} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copied' : 'Copy command'}</TooltipContent>
      </Tooltip>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Install command copied' : ''}
      </span>
    </div>
  );
}
