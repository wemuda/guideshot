import { Card, CardContent } from '@guideshot/ui/components/card';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';

export const metadata: Metadata = {
  title: 'Concepts',
  description: 'Understand the pieces that turn intent into an artifact.',
};

const concepts = [
  ['Recipe', 'The declarative source of truth for one visual explanation.'],
  ['Target', 'A stable product-owned name attached to a meaningful element.'],
  [
    'Profile',
    'The browser environment: viewport, pixel ratio, timezone, and motion.',
  ],
  [
    'Dimension',
    'A finite axis such as locale, theme, role, plan, or feature state.',
  ],
  [
    'Scenario',
    'Reviewed TypeScript that creates authenticated or seeded state.',
  ],
  [
    'Capture',
    'Sanitized pixels plus the measured geometry of resolved targets.',
  ],
  [
    'Composition',
    'Offline rendering of callouts, emphasis, connectors, and labels.',
  ],
  [
    'Manifest',
    'The published index of variants, intrinsic dimensions, hashes, and alt text.',
  ],
] as const;

export default function ConceptsPage() {
  return (
    <DocsPage
      description="You will learn which concerns belong in recipes, which belong in project code, and why GuideShot separates capture from composition."
      href="/docs/concepts"
      title="A small vocabulary for durable guides."
    >
      <DocsSection title="The eight pieces">
        <div className="grid gap-3 sm:grid-cols-2">
          {concepts.map(([title, description]) => (
            <Card key={title} size="sm">
              <CardContent className="pt-4">
                <h2 className="text-card-title font-semibold text-foreground">
                  {title}
                </h2>
                <p className="mt-1 text-body leading-6 text-text-secondary">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        description="Recipes stay portable because they contain data. Scenarios and dimensions can use project code because they are reviewed application adapters."
        title="Intent in recipes, state in adapters"
      >
        <p>
          A recipe can request an authenticated workspace without knowing how
          your application creates one. The scenario returns safe browser state;
          the recipe only names the scenario and its synthetic inputs.
        </p>
      </DocsSection>

      <DocsSection
        description="A capture is expensive and connected to the running app. Composition is deterministic and can run again without a browser."
        title="Capture once, explain many ways"
      >
        <p>
          Changing callout copy, connector placement, spotlight strength, or
          output format can reuse a valid sanitized capture. A changed page,
          target, profile, dimension, or scenario produces a new capture
          identity.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
