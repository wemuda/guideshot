import { Card, CardContent } from '@guideshot/ui/components/card';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';
import { GuideCarousel } from '@/components/guide-carousel';
import { HighlightedCode } from '@/components/highlighted-code';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Understand the GuideShot workflow in sixty seconds.',
};

const firstRecipe = `{
  "$schema": "https://guideshot.dev.wemuda.com/schemas/recipe.v1.json",
  "version": 1,
  "id": "release.create",
  "profile": "guide.desktop",
  "page": { "path": "/releases" },
  "ready": [
    { "expect": "visible", "target": "release.create" }
  ],
  "annotations": [{
    "id": "create",
    "kind": "callout",
    "target": "release.create",
    "content": { "en": "Start the release here." }
  }],
  "output": { "formats": ["webp"] }
}`;

const pipeline = [
  ['1', 'Describe', 'A recipe names the page, stable target, and explanation.'],
  ['2', 'Prepare', 'A reviewed adapter creates the exact product state.'],
  ['3', 'Capture', 'GuideShot records pixels and target geometry in Chromium.'],
  [
    '4',
    'Publish',
    'The renderer adds guidance and writes a versioned manifest.',
  ],
] as const;

export default function DocumentationOverviewPage() {
  return (
    <DocsPage
      description="In one minute, you will see the smallest complete recipe, the artifact it publishes, and where each part of the system belongs."
      href="/docs"
      title="A product state anyone can follow."
    >
      <DocsSection
        description="This is a real generated guide, not a hand-built mockup. Its language and theme controls select other artifacts from the published manifest."
        title="Start with the result"
      >
        <GuideCarousel />
      </DocsSection>

      <DocsSection
        description="The recipe contains portable visual intent. It does not contain credentials, browser callbacks, or application setup code."
        title="The input is a reviewed recipe"
      >
        <HighlightedCode code={firstRecipe} language="json" />
      </DocsSection>

      <DocsSection
        description="GuideShot keeps application preparation, browser capture, and image composition separate so each layer remains reviewable."
        title="The complete pipeline"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {pipeline.map(([number, title, description]) => (
            <Card key={number} size="sm">
              <CardContent className="pt-4">
                <p className="font-mono text-caption text-primary">{number}</p>
                <h3 className="mt-2 text-card-title font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-body leading-6 text-text-secondary">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DocsSection>
    </DocsPage>
  );
}
