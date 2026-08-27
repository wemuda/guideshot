import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@guideshot/ui/components/alert';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';
import { HighlightedCode } from '@/components/highlighted-code';

export const metadata: Metadata = {
  title: 'Getting started',
  description: 'Install GuideShot and publish one annotated artifact.',
};

const config = `import { defineConfig } from '@guideshot/core'
import { playwrightDriver } from '@guideshot/playwright'
import { htmlRenderer } from '@guideshot/renderer'

export default defineConfig({
  recipes: ['shots/**/*.shot.json'],
  outputDir: 'public/generated/guideshot',
  server: { url: 'http://localhost:3000', command: 'pnpm dev' },
  safety: { allowedOrigins: ['http://localhost:3000'] },
  profiles: {
    'guide.desktop': { viewport: { width: 1280, height: 960 } }
  },
  driver: playwrightDriver(),
  renderer: htmlRenderer()
})`;

const target = `<button data-guide-target="release.create">
  Create release
</button>`;

const recipe = `{
  "$schema": "https://guideshot.dev.wemuda.com/schemas/recipe.v1.json",
  "version": 1,
  "id": "release.create",
  "profile": "guide.desktop",
  "page": { "path": "/releases" },
  "ready": [{ "expect": "visible", "target": "release.create" }],
  "annotations": [{
    "id": "create",
    "kind": "callout",
    "target": "release.create",
    "content": { "en": "Create the release from one clear action." }
  }],
  "output": { "formats": ["webp"], "width": 1600 }
}`;

export default function GettingStartedPage() {
  return (
    <DocsPage
      description="By the end of this page, one command will start your app, find a stable product target, and publish an annotated WebP artifact."
      href="/docs/getting-started"
      title="Publish your first guide."
    >
      <DocsSection title="1. Install the capture stack">
        <HighlightedCode
          code={`pnpm add -D @guideshot/cli @guideshot/core @guideshot/playwright @guideshot/renderer playwright
pnpm exec playwright install chromium`}
          language="shellscript"
        />
      </DocsSection>

      <DocsSection
        description="GuideShot starts the existing application command and only visits origins you explicitly allow."
        title="2. Configure the project"
      >
        <HighlightedCode code={config} language="typescript" />
      </DocsSection>

      <DocsSection
        description="Targets are stable names owned by the product. They survive layout changes better than CSS selectors."
        title="3. Mark the product action"
      >
        <HighlightedCode code={target} language="typescript" />
      </DocsSection>

      <DocsSection
        description="This recipe waits for the button, captures the real page, and attaches an explanation to the named target."
        title="4. Write one recipe"
      >
        <HighlightedCode code={recipe} language="json" />
      </DocsSection>

      <DocsSection
        description="Validate first, inspect the planned jobs, then capture. Verify checks the manifest, files, hashes, dimensions, and alt text."
        title="5. Capture and verify"
      >
        <HighlightedCode
          code={`pnpm exec guideshot validate
pnpm exec guideshot plan
pnpm exec guideshot capture
pnpm exec guideshot verify`}
          language="shellscript"
        />
        <Alert>
          <AlertTitle>The result is ordinary static media</AlertTitle>
          <AlertDescription>
            Read the generated manifest in your site, documentation tool, test
            suite, or release workflow. No GuideShot runtime is required in the
            published experience.
          </AlertDescription>
        </Alert>
      </DocsSection>
    </DocsPage>
  );
}
