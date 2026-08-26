'use client';

import { ThemeProvider } from '@guideshot/ui/components/theme-provider';
import { TooltipProvider } from '@guideshot/ui/components/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider delayDuration={500}>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
