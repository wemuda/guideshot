import { Card, CardContent } from '@guideshot/ui/components/card';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';
import { HighlightedCode } from '@/components/highlighted-code';

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Reference the fields that define a GuideShot artifact.',
};

const parts = [
  [
    'page',
    'Where the browser navigates. Paths remain relative to the allowed server origin.',
  ],
  [
    'prepare',
    'Typed clicks, fills, key presses, and waits that create the visible state.',
  ],
  ['ready', 'Assertions that prove the state is stable before capture begins.'],
  [
    'capture.frame',
    'The viewport, page, target, region, or padded target group to publish.',
  ],
  [
    'annotations',
    'Callouts, arrows, spotlights, outlines, markers, labels, and redactions.',
  ],
  ['accessibility', 'Localized alt text for every declared output variant.'],
  ['output', 'Formats, width, height, pixel ratio, and publication behavior.'],
] as const;

const deviceRecipes = `{
  "id": "workspace.desktop",
  "profile": "guide.desktop",
  "capture": {
    "frame": { "target": "workspace", "aspectRatio": "16:9" }
  },
  "output": { "width": 1920, "formats": ["webp"] }
}

{
  "id": "workspace.tablet",
  "profile": "guide.tablet",
  "capture": {
    "frame": { "target": "workspace", "aspectRatio": "4:3" }
  },
  "output": { "width": 1600, "formats": ["webp"] }
}

{
  "id": "workspace.mobile",
  "profile": "guide.mobile",
  "capture": {
    "frame": { "target": "workspace", "aspectRatio": "9:16" }
  },
  "output": { "width": 1080, "formats": ["webp"] }
}`;

export default function RecipesPage() {
  return (
    <DocsPage
      description="You will be able to place each concern in the right recipe field and define device-specific artifacts without distorting the captured scene."
      href="/docs/recipes"
      title="Describe the artifact, not the implementation."
    >
      <DocsSection title="Recipe anatomy">
        <div className="grid gap-3 sm:grid-cols-2">
          {parts.map(([name, description]) => (
            <Card key={name} size="sm">
              <CardContent className="pt-4">
                <code className="font-mono text-control font-semibold text-foreground">
                  {name}
                </code>
                <p className="mt-2 text-body leading-6 text-text-secondary">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        description="The profile controls the browser viewport. capture.frame.aspectRatio controls the artifact. Supplying one output dimension derives the other without stretching."
        title="Publish the right shape for each device"
      >
        <HighlightedCode code={deviceRecipes} language="json" />
        <ul className="grid gap-2 text-foreground sm:grid-cols-3">
          <li className="rounded-lg border border-separator p-3">
            Desktop: 1920×1080
          </li>
          <li className="rounded-lg border border-separator p-3">
            Tablet: 1600×1200
          </li>
          <li className="rounded-lg border border-separator p-3">
            Mobile: 1080×1920
          </li>
        </ul>
      </DocsSection>
    </DocsPage>
  );
}
