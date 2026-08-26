import { highlightCode, type CodeLanguage } from '@/lib/highlight-code';
import { CopyCodeButton } from '@/components/copy-code-button';

export async function HighlightedCode({
  code,
  language,
}: {
  readonly code: string;
  readonly language: CodeLanguage;
}) {
  const html = await highlightCode(code, language);

  return (
    <div className="shiki-code relative min-w-0 overflow-hidden rounded-lg border border-card-border bg-card">
      <CopyCodeButton code={code} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
