import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@guideshot/ui/components/table';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';
import { HighlightedCode } from '@/components/highlighted-code';

export const metadata: Metadata = {
  title: 'CLI',
  description: 'Run and automate the GuideShot pipeline.',
};

const commands = [
  ['validate', 'Validate configuration, recipes, and references.'],
  ['schema', 'Write editor-friendly recipe and manifest schemas.'],
  ['plan', 'Inspect expanded jobs, variants, and cache identities.'],
  ['capture', 'Prepare, capture, compose, and atomically publish.'],
  ['compose', 'Re-render valid sanitized captures without the app.'],
  ['verify', 'Check the manifest, files, hashes, dimensions, and alt text.'],
] as const;

export default function CliPage() {
  return (
    <DocsPage
      description="You will be able to run the full pipeline locally, focus on selected recipes, consume JSON reports, and verify generated output in CI."
      href="/docs/cli"
      title="One workflow from local review to CI."
    >
      <DocsSection title="Commands">
        <div className="max-w-full overflow-x-auto rounded-lg border border-card-border bg-card">
          <Table aria-label="GuideShot CLI commands">
            <TableHeader>
              <TableRow>
                <TableHead>Command</TableHead>
                <TableHead>What it gives you</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commands.map(([command, description]) => (
                <TableRow key={command}>
                  <TableCell>
                    <code className="font-mono text-caption text-foreground">
                      guideshot {command}
                    </code>
                  </TableCell>
                  <TableCell className="min-w-[260px] text-text-secondary">
                    {description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DocsSection>

      <DocsSection
        description="Use filters during development, JSON output in automation, and cached composition when only the explanatory layer changed."
        title="Focused and automated runs"
      >
        <HighlightedCode
          code={`pnpm exec guideshot plan --recipe release.create
pnpm exec guideshot capture --recipe release.create --json > report.json
pnpm exec guideshot compose --recipe release.create
pnpm exec guideshot verify --json`}
          language="shellscript"
        />
        <p>
          CI should fail on validation, capture, composition, or verification
          errors. Publication completes only when every requested variant has
          succeeded, so the manifest never points at a partial run.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
