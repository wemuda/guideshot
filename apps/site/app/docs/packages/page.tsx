import { Package02Icon } from '@hugeicons/core-free-icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@guideshot/ui/components/card';
import { Icon } from '@guideshot/ui/components/icon';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Choose the GuideShot packages your workflow needs.',
};

const packages = [
  [
    '@guideshot/schema',
    'Use this for JSON schemas, strict recipe validation, and manifest types.',
  ],
  [
    '@guideshot/core',
    'Use this for configuration, planning, dimensions, scenarios, hashes, and safety checks.',
  ],
  [
    '@guideshot/playwright',
    'Use this to prepare real application state, resolve targets, and capture Chromium.',
  ],
  [
    '@guideshot/renderer',
    'Use this to compose annotations and publish final image assets offline.',
  ],
  [
    '@guideshot/cli',
    'Use this for the validate, plan, capture, compose, and verify commands.',
  ],
] as const;

export default function PackagesPage() {
  return (
    <DocsPage
      description="You will know which package owns each part of the workflow and which dependencies belong in a standard project setup."
      href="/docs/packages"
      title="Narrow packages, explicit boundaries."
    >
      <DocsSection
        description="Most applications install the CLI, Playwright driver, and renderer. Core and schema are available directly when you build project adapters or tooling."
        title="Package map"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {packages.map(([name, description]) => (
            <Card key={name} size="sm">
              <CardHeader>
                <span className="grid size-8 place-items-center rounded-lg border border-control-border text-primary">
                  <Icon icon={Package02Icon} />
                </span>
                <CardTitle className="break-all font-mono text-control">
                  {name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-body leading-6 text-text-secondary">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </DocsSection>
    </DocsPage>
  );
}
