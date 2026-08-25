import { Brand } from '@/components/brand';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Brand className="text-sm text-foreground" />
        <p>Open source under MIT. Built for reproducible product guidance.</p>
      </div>
    </footer>
  );
}
