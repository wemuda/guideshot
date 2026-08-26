'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { Icon } from '@guideshot/ui/components/icon';
import { useState } from 'react';

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const input = document.createElement('textarea');
    input.value = code;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}

export function CopyCodeButton({ code }: { readonly code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      aria-label={copied ? 'Code copied' : 'Copy code'}
      className="absolute right-2 top-2 z-10"
      onClick={() => {
        void copyCode(code).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      <Icon icon={copied ? Tick02Icon : Copy01Icon} />
    </Button>
  );
}
