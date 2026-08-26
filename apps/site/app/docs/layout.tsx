import { DocsShell } from '@/components/docs-shell';

export default function DocumentationLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
