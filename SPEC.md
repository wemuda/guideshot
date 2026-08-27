# GuideShot Specification

Status: Draft 0.1  
Schema version: 1  
Runtime baseline: Node.js 20 or newer

## 1. Purpose

GuideShot is a portable system for generating reproducible, annotated screenshots of real web application states. A single declarative recipe can produce screenshots across languages, themes, viewports, roles, brands, or other project-defined variants.

The system is intended for user guides, setup instructions, onboarding, support documentation, release notes, and other material where a screenshot must explain a real interface rather than merely record it.

The central boundary is:

> Recipes describe reproducible visual intent. Project adapters explain how a particular application creates that state.

GuideShot is not tied to a frontend framework, product domain, test runner, or documentation system. The CLI and Node.js library are the authoritative interfaces. Vite is supported through an optional adapter that consumes generated assets and manifests.

## 2. Goals

- Generate every required screenshot variant from one declarative recipe.
- Support authenticated, tenant-aware, data-dependent application states.
- Anchor framing and annotations to stable DOM elements rather than coordinates.
- Keep application-specific behavior out of the portable schema.
- Separate browser capture from annotation composition.
- Produce deterministic, cacheable, reviewable artifacts.
- Integrate cleanly with Vite without requiring Vite.
- Remain extractable as a standalone open package.
- Provide strong validation, editor completion, diagnostics, and CI behavior.
- Treat privacy and authenticated browser access as first-class concerns.

## 3. Non-goals

- Owning guide sequencing, progress, or completion state.
- Replacing application end-to-end tests.
- Serving as a complete visual-regression platform.
- Inferring arbitrary application state without project configuration.
- Executing unrestricted JavaScript embedded in recipe files.
- Making production builds depend on a browser, backend, or seed environment.

Guide UIs may consume GuideShot outputs, but guide content remains a separate product layer.

## 4. Architectural decisions

| Concern | Decision |
| --- | --- |
| Primary interface | CLI and Node.js library |
| Vite integration | Optional thin plugin |
| Default browser runtime | Playwright Library with Chromium |
| Recipe format | Strict JSON, with JSONC as an authoring convenience |
| Public contract | JSON Schema Draft 2020-12 |
| Application behavior | Typed project adapters |
| Annotation rendering | Separate composition phase |
| Runtime outputs | Images and a public manifest |
| Internal outputs | Sanitized scenes, generation report, diagnostics, and cache |
| Guide rendering | Separate consumer package or application code |
| Visual comparison | Optional integration rather than core behavior |

The browser-driver interface permits future Puppeteer, WebDriver, remote-browser, or hosted-rendering implementations without changing recipes.

## 5. System overview

```text
                         Project adapter
                    auth · scenarios · locale
                    theme · data · custom actions
                                │
.recipe.json ──► compiler ──► capture jobs ──► browser driver
                    │               │                │
                    │               │                ▼
                    │               │        sanitized raw scene
                    │               │        image + DOM geometry
                    │               │                │
                    │               └───────────────►│
                    │                                ▼
                    └────────────────────────► annotation composer
                                                     │
                                                     ▼
                                          images + public manifest
                                                     │
                                ┌────────────────────┴───────────────────┐
                                ▼                                        ▼
                         Vite adapter                              any other consumer
                  virtual module · HMR · assets                  filesystem · CDN · docs
```

## 6. Package architecture

GuideShot is structured as a publishable package family:

```text
@guideshot/schema
@guideshot/core
@guideshot/playwright
@guideshot/renderer
@guideshot/cli
@guideshot/vite
@guideshot/react       optional, later
```

### `@guideshot/schema`

- Published core and manifest JSON Schemas.
- Generated TypeScript types.
- Schema-version metadata.
- Valid and invalid conformance fixtures.

### `@guideshot/core`

- Recipe parsing and normalization.
- Core and extension validation.
- Profile and configuration resolution.
- Matrix expansion and job planning.
- Dependency graphs and source fingerprints.
- Capture and composition hashes.
- Plugin and capability registry.
- Public and private manifest construction.
- Stable diagnostic codes.

It has no browser, Vite, React, or application dependency.

### `@guideshot/playwright`

- Playwright browser lifecycle.
- Browser-context isolation.
- Locator resolution.
- Standard actions and expectations.
- Geometry measurement.
- Screenshot capture.
- Failure traces and browser diagnostics.

### `@guideshot/renderer`

- Offline annotation composition.
- Deterministic placement and collision handling.
- Annotation themes and bundled fonts.
- Framing, resizing, and final encoding.
- Clean and annotated preview generation.

### `@guideshot/cli`

- Configuration loading.
- Server lifecycle.
- Capture scheduling and concurrency.
- Cache and artifact-store management.
- Atomic output publication.
- Human and machine-readable reports.

### `@guideshot/vite`

- Virtual runtime manifest.
- Development asset middleware.
- Manifest HMR.
- Build-time asset emission.
- Missing and stale asset enforcement.

It does not launch browsers or prepare application state.

### `@guideshot/react`

- Optional framework consumer such as `<GuideScreenshot>`.
- Locale, theme, and viewport variant resolution.
- Alt-text propagation.
- Loading and fallback behavior.

## 7. Configuration and recipe boundary

Project configuration is executable trusted code. Recipes are portable, declarative data.

A project configuration may define:

- Recipe discovery paths.
- Output and cache directories.
- Server startup or external base URL.
- Allowed origins.
- Browser driver.
- Profiles and viewports.
- Variant dimensions.
- Scenarios and named flows.
- Custom actions and expectations.
- Translation resolution.
- Annotation themes and fonts.
- Source sets for staleness detection.
- Artifact storage.
- Privacy and diagnostics policies.

Example:

```ts
import { defineConfig } from '@guideshot/core'
import { playwrightDriver } from '@guideshot/playwright'
import { htmlRenderer } from '@guideshot/renderer'

export default defineConfig({
  recipes: ['docs/screenshots/**/*.shot.json'],
  outputDir: 'generated/guideshot',
  cacheDir: '.guideshot/cache',
  server: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
  },
  safety: {
    allowedOrigins: ['http://localhost:3000'],
  },
  driver: playwrightDriver({ browser: 'chromium' }),
  renderer: htmlRenderer(),
  profiles: {},
  dimensions: {},
  scenarios: {},
  sourceSets: {},
})
```

Recipes must never contain credentials, environment secrets, database access, or executable scripts.

## 8. Recipe schema

A representative recipe:

```json
{
  "$schema": "../.guideshot/project.schema.json",
  "version": 1,
  "id": "menu.create-recipe.name",
  "title": "Enter the recipe name",
  "tags": ["menu", "recipe", "setup"],
  "profile": "guide.desktop",

  "scenario": {
    "use": "example:authenticated-user",
    "with": {
      "organization": "docs-demo",
      "department": "main-kitchen",
      "role": "organization-admin"
    }
  },

  "page": {
    "path": "/menu/recipes"
  },

  "matrix": {
    "locale": ["en", "da", "nb"],
    "theme": ["light", "dark"]
  },

  "prepare": [
    {
      "do": "click",
      "target": "recipes.create"
    },
    {
      "do": "fill",
      "target": "recipe.name",
      "value": {
        "message": "guides.menu.exampleRecipeName"
      }
    }
  ],

  "ready": [
    {
      "expect": "visible",
      "target": "recipe.form"
    },
    {
      "expect": "hidden",
      "target": "app.loading"
    }
  ],

  "capture": {
    "frame": {
      "around": ["recipe.form"],
      "padding": 32,
      "aspectRatio": "4:3",
      "fit": "expand"
    },
    "pixelRatio": 2,
    "stability": "documentation"
  },

  "annotations": [
    {
      "id": "recipe-name",
      "kind": "callout",
      "target": "recipe.name",
      "content": {
        "message": "guides.menu.enterRecipeName"
      },
      "placement": {
        "side": "auto",
        "offset": 16
      },
      "connector": {
        "kind": "arrow",
        "anchor": "center"
      },
      "emphasis": {
        "kind": "spotlight",
        "padding": 6
      }
    }
  ],

  "accessibility": {
    "alt": {
      "message": "guides.menu.enterRecipeNameAlt"
    }
  },

  "output": {
    "formats": ["webp"],
    "quality": 92
  }
}
```

One recipe can therefore generate every declared locale and theme combination.

## 9. Schema validation

The public contract uses JSON Schema Draft 2020-12. Unknown properties are rejected with `unevaluatedProperties: false` wherever extension data is not explicitly permitted.

Validation has three levels.

### Core validation

Validates universal fields:

- Identity and schema version.
- Page and matrix definitions.
- Standard actions and expectations.
- Framing and capture behavior.
- Annotation structure.
- Accessibility content.
- Output settings.

### Extension validation

Each scenario, dimension, action, expectation, renderer, or plugin can publish a parameter schema. The core compiler validates the extension envelope, then delegates the extension payload to its registered schema.

### Resolved-job validation

After profiles, variants, variables, scenario outputs, and defaults are resolved, every concrete job is validated again. No unresolved reference may reach the browser driver.

The CLI generates a project-specific compound schema:

```text
.guideshot/project.schema.json
```

It combines the core schema with every installed extension so editors can complete and validate project-specific fields.

Schema versions are independent of package versions. A `guideshot migrate` command rewrites supported older recipes.

## 10. Scenarios and application state

Domain concepts do not become core schema fields. They belong to project scenarios.

```ts
defineScenario({
  name: 'example:authenticated-user',
  schema: authenticatedUserScenarioSchema,
  prepare: async context => {
    // Create or load an isolated authenticated session.
    // Select project-specific state.
    // Return safe variables for the recipe.
  },
})
```

A scenario may:

- Create or restore authenticated state.
- Seed or reset deterministic data.
- Select a tenant, department, workspace, repository, or account.
- Configure permissions and feature flags.
- Install safe network mocks.
- Return variables such as generated IDs.
- Declare a concurrency key when state cannot be shared.
- Declare its own source and dataset revision.

Recipes may interpolate scenario outputs through a restricted reference syntax:

```json
{
  "path": "/recipes/${scenario.recipeId}"
}
```

References are data lookups, not executable expressions. Missing or incorrectly typed variables fail during resolved-job validation.

## 11. Targets and locators

The preferred target contract is a stable application marker:

```tsx
<Button data-guide-target="recipes.create">Create recipe</Button>
```

The recipe uses its stable reference:

```json
{
  "target": "recipes.create"
}
```

The target attribute is configurable per project.

Detailed locator forms support applications that cannot add markers:

```json
{
  "target": {
    "by": "role",
    "role": "button",
    "name": {
      "message": "recipes.actions.create"
    }
  }
}
```

Supported locator forms include:

- Stable target reference.
- Accessible role and localized name.
- Label, placeholder, alt text, and title.
- Explicit CSS fallback.
- Nested `within` scopes.
- Repeated targets with an explicit instance key.
- Frame-scoped targets.

Every target used for an action, expectation, frame, privacy rule, or annotation resolves to exactly one element unless multiple matching is explicitly requested.

Text selectors and translated labels should not be the normal contract because they change across language variants.

## 12. Actions

The standard action set is deliberately constrained:

```text
click
fill
clear
press
select
check
uncheck
hover
focus
scroll
upload
drag
waitFor
invoke
```

`invoke` calls a named adapter action:

```json
{
  "do": "invoke",
  "use": "example:select-department",
  "with": {
    "department": "main-kitchen"
  }
}
```

Rules:

- Recipes contain no arbitrary JavaScript.
- Version 1 has no loops or conditional branching.
- Fixed sleeps are rejected by default in committed recipes.
- Standard browser actions use locator actionability and auto-waiting.
- A retry reruns the complete job in a fresh context.
- Shared preparation belongs in scenarios or named flows.
- Mutating actions require an isolated or resettable scenario.
- Custom actions are namespaced and schema-validated.

## 13. Expectations and readiness

Readiness is explicit. A recipe can require:

- Target visibility or absence.
- Enabled, disabled, checked, or editable state.
- Text, value, attribute, or count.
- URL or route state.
- A project-defined application signal.
- A named network response.

After recipe expectations pass, the capture engine applies its stability policy:

- Fonts have loaded.
- Images inside the capture region have decoded.
- Required targets are fully visible.
- Target geometry is stable across multiple samples.
- CSS animations and transitions are disabled for capture.
- The caret is hidden.
- No configured loading or busy state is visible.
- No unapproved page, console, or network error occurred.

`networkidle` and fixed sleeps are not accepted as sufficient readiness on their own.

## 14. Variants and matrices

Locale and theme are standard dimensions rather than hardcoded behavior.

```ts
dimensions: {
  locale: localeDimension({
    values: ['en', 'da', 'nb'],
  }),
  theme: themeDimension({
    values: ['light', 'dark'],
  }),
}
```

A dimension provider may:

- Configure browser-context values.
- Set cookies or storage before navigation.
- Install an initialization script.
- Call an application API.
- Verify the active value after application startup.
- Add the resolved value to artifact identity and provenance.

Other project-defined dimensions may include:

```text
viewport
role
featureSet
density
platform
currency
region
brand
```

Matrices support `include` and `exclude` rules. CLI filters can select individual values without changing recipes.

Locale application should set both browser-level locale behavior and application-level language state. Theme application should set both media preference and application state before first paint.

## 15. Framing and zoom

The system distinguishes:

- `viewport`: responsive layout dimensions.
- `pixelRatio`: output density.
- `frame`: the part of the rendered page included in the image.
- `output.width` and `output.height`: presentation size.
- `browserZoom`: an explicit escape hatch.

Most visual zooming should use target framing and output resizing:

```json
{
  "capture": {
    "frame": {
      "around": ["recipe.form"],
      "padding": 32,
      "aspectRatio": "4:3"
    }
  },
  "output": {
    "width": 1280
  }
}
```

This enlarges the useful interface without changing responsive breakpoints.

Framing modes:

- Full viewport.
- Full page.
- Single target.
- Union of several targets.
- Explicit region.
- Target with surrounding context.
- Magnified inset.

Fit strategies define how padding and aspect ratio interact:

```text
expand
contain
cover
crop
```

Browser zoom is permitted only when documenting an actual browser-zoom state because it can alter layout and produce a misleading representation.

## 16. Annotation model

Core annotation primitives:

```text
callout
arrow
spotlight
outline
marker
label
magnifier
redaction
```

A callout can include its connector and target emphasis because they normally represent one semantic instruction.

Annotation text is a localized plain-text value:

```json
{
  "content": {
    "message": "guides.menu.enterRecipeName",
    "args": {
      "example": "${scenario.exampleName}"
    }
  }
}
```

Literal values and explicit locale maps may be supported, but translation-provider keys are preferred for application documentation.

### Automatic placement

Automatic placement is deterministic:

1. Generate candidate positions around the target.
2. Reject positions outside the frame safe area.
3. Reject positions covering protected targets.
4. Resolve collisions in annotation-ID order.
5. Expand framing when permitted.
6. Fail with a diagnostic image when no valid placement exists.

### Manual adjustment

```json
{
  "placement": {
    "side": "right",
    "align": "start",
    "offset": 20,
    "nudge": {
      "x": 8,
      "y": -4
    }
  }
}
```

Coordinates are adjustments rather than primary anchors.

### Annotation themes

Annotation presentation is controlled through reusable themes containing:

- Font family and weights.
- Text size and line height.
- Callout colors.
- Border radius and shadow.
- Connector shape and thickness.
- Spotlight and scrim behavior.
- Safe areas and spacing.
- Light and dark variants.

The renderer bundles or explicitly resolves its fonts so composition does not depend on host fonts.

## 17. Capture and composition pipeline

Annotations are not injected into the live application before capture.

### Capture phase

The browser driver produces a sanitized scene containing:

- Clean screenshot buffer.
- Target and visible rectangles.
- Viewport and scroll state.
- Frame coordinates.
- Locale and text direction.
- Theme and variant values.
- Pixel ratio.
- Browser and driver versions.
- Relevant target styling such as border radius when requested.

### Privacy phase

Sensitive regions are masked or transformed before a raw scene can be written to disk. Unsanitized image buffers exist only in memory and are discarded immediately.

### Composition phase

A separate, network-disabled browser page renders:

- The sanitized screenshot as a background.
- Annotation HTML and SVG.
- Bundled annotation fonts.
- Deterministic callout layout.
- Final framing and resizing.
- PNG or WebP output.

Benefits:

- Annotation changes do not require reopening the application.
- Annotation translations can be recomposed independently.
- Application stacking contexts cannot affect annotation presentation.
- Clean and annotated versions can be previewed together.
- The renderer works with any browser driver.
- The default implementation does not require a native canvas dependency.

Raw scenes are cache artifacts, not production assets.

## 18. Determinism

A documentation profile should define:

- Fixed viewport.
- Fixed pixel ratio.
- Fixed locale.
- Fixed timezone.
- Fixed color scheme.
- Reduced motion.
- Fixed date or clock when needed.
- Controlled data.
- Pinned browser and driver versions.
- Capture-only styles for volatile elements.

Byte-identical output is guaranteed only within an equivalent rendering environment. CI generation should use a pinned browser container because operating system, browser, hardware, and font differences can affect output.

Canvas, WebGL, maps, third-party embeds, and asynchronously animated charts may require project-specific readiness or capture adapters.

## 19. Caching and source fingerprints

Every job has separate capture and composition hashes.

### Capture hash

Includes:

- Normalized page, scenario, actions, expectations, and frame.
- Scenario and adapter versions.
- Variant values.
- Application source fingerprint.
- Dataset revision.
- Browser and driver versions.
- Relevant profile configuration.

### Composition hash

Includes:

- Sanitized scene hash.
- Annotation definitions.
- Resolved annotation messages.
- Annotation theme and fonts.
- Renderer version.
- Output settings.

Consequences:

- Changing callout copy only recomposes.
- Changing annotation presentation only recomposes.
- Changing page layout recaptures.
- Changing unrelated source does not recapture when dependency source sets are configured.

Projects can define source sets:

```ts
sourceSets: {
  shell: ['src/components/app-shell/**', '../ui/src/**'],
  menu: ['src/screens/Menu/**', 'src/locales/*/menu.json'],
}
```

A recipe references them:

```json
{
  "inputs": ["shell", "menu"]
}
```

The Vite adapter may map changed files to source sets, mark affected outputs stale, and emit HMR. Automatic recapture on every source edit is opt-in; the default is to report staleness and offer an explicit refresh.

## 20. Scheduling, concurrency, and retries

- Launch a browser once per compatible run when possible.
- Use an isolated browser context for each job or compatible job group.
- Limit concurrency through project and CI configuration.
- Allow scenarios to declare an exclusive concurrency key.
- Detect output collisions before execution.
- Retry complete jobs from clean state.
- Record retry attempts in the private report.
- Stop and clean up only servers started by the current GuideShot run.
- Respond to cancellation signals and close contexts gracefully.

Jobs and manifest entries are ordered deterministically regardless of execution order.

## 21. Outputs and manifests

Public output:

```text
generated/guideshot/
├── manifest.json
└── assets/
    ├── menu.create-recipe.name.da.dark.desktop.<hash>.webp
    ├── menu.create-recipe.name.da.light.desktop.<hash>.webp
    └── ...
```

Representative manifest entry:

```json
{
  "id": "menu.create-recipe.name",
  "variants": {
    "locale=da;theme=dark;viewport=desktop": {
      "src": "./assets/menu.create-recipe.name.da.dark.desktop.a91f.webp",
      "width": 1280,
      "height": 960,
      "format": "webp",
      "hash": "a91f...",
      "alt": "Feltet til opskriftens navn er fremhævet."
    }
  }
}
```

The public manifest excludes:

- Authentication state.
- Scenario secrets.
- Private organization or account identifiers.
- Local filesystem paths.
- Browser traces.
- Private generation parameters.

A private run report contains detailed provenance and diagnostics.

Output publication is transactional:

1. Generate into a temporary run directory.
2. Validate every requested variant.
3. Confirm manifest and file integrity.
4. Atomically replace the selected output set.

A partial failure does not publish a partially updated manifest unless partial publication is explicitly requested.

## 22. Accessibility

Every public screenshot requires localized alt text or an explicit decorative declaration.

Alt text may be:

- A translation-provider message.
- An inline locale map.
- A literal value for a single-locale project.

The system does not generate semantic alt text from pixels. It may offer a draft assembled from annotation text, but authored alt text remains the contract.

Guide consumers must remain understandable without the image. This is outside GuideShot enforcement but should be documented as an integration requirement.

## 23. Security and privacy

Defaults are conservative:

- Refuse non-loopback origins unless explicitly allowed.
- Require an allowlist for every navigable origin.
- Reject file URLs and unsupported protocols by default.
- Never permit credentials inside recipes.
- Never run production credentials in untrusted pull-request jobs.
- Prefer ephemeral documentation tenants or deterministic mocks.
- Validate output paths against traversal and collisions.
- Block network access in the annotation compositor.
- Escape all annotation content.
- Redact secrets from logs and reports.
- Keep traces private and short-lived.
- Apply privacy masks before raw scenes are persisted.
- Warn when capture targets contain likely personal or secret data.
- Do not expose scenario parameters in public manifests.

Recipes are non-executable data, but they can direct an authenticated browser. They are therefore trusted repository code and require review.

Project adapters are executable code with the same trust level as application test infrastructure.

## 24. Failure diagnostics

Stable error categories should include:

```text
RECIPE_SCHEMA_INVALID
EXTENSION_NOT_REGISTERED
VARIABLE_UNRESOLVED
SERVER_NOT_READY
ORIGIN_NOT_ALLOWED
SCENARIO_FAILED
NAVIGATION_FAILED
TARGET_NOT_FOUND
TARGET_NOT_UNIQUE
TARGET_NOT_VISIBLE
EXPECTATION_FAILED
LAYOUT_UNSTABLE
ANNOTATION_LAYOUT_FAILED
PRIVACY_POLICY_FAILED
CAPTURE_FAILED
COMPOSITION_FAILED
OUTPUT_COLLISION
MANIFEST_INVALID
OUTPUT_STALE
```

Where privacy permits, failed jobs retain:

- Failure screenshot.
- Sanitized resolved recipe.
- Console errors.
- Failed request summary.
- Target-resolution diagnostics.
- Annotation-layout diagnostics.
- Playwright trace.

The CLI supports both concise terminal output and a versioned JSON report.

## 25. CLI contract

Recommended commands:

```text
guideshot validate
guideshot schema
guideshot plan
guideshot capture
guideshot capture --changed
guideshot capture --id <recipe-id>
guideshot compose
guideshot verify
guideshot inspect
guideshot dev
guideshot doctor
guideshot clean
guideshot migrate
```

### `validate`

Validates project configuration, recipes, extension payloads, references, and output identities without starting a browser.

### `schema`

Generates the compound project schema for editor integration.

### `plan`

Prints the expanded job matrix, cache state, dependencies, and output names without executing jobs.

### `capture`

Starts or attaches to the configured application environment, executes selected jobs, composes outputs, and atomically updates the manifest.

### `compose`

Re-renders annotations from valid cached scenes without reopening the application.

### `verify`

Checks required variants, staleness, hashes, dimensions, alt text, and manifest integrity.

### `inspect`

Opens a headed browser showing target identity, frame bounds, privacy regions, and provisional annotation layout.

### `dev`

Watches recipes and relevant inputs and serves a comparison gallery for clean, annotated, locale, and theme variants.

### `doctor`

Checks browser installation, server reachability, allowed origins, registered extensions, fonts, and writable output paths.

### `migrate`

Rewrites supported older recipe or manifest versions.

All relevant commands support `--json` for machine-readable output and filtering by recipe, tag, profile, or matrix dimension.

## 26. Vite integration

Usage:

```ts
import { guideShots } from '@guideshot/vite'

export default defineConfig({
  plugins: [
    guideShots({
      manifest: './generated/guideshot/manifest.json',
      stale: process.env.CI ? 'error' : 'warn',
    }),
  ],
})
```

The plugin exposes:

```ts
import {
  manifest,
  resolveGuideShot,
} from 'virtual:guideshot/manifest'
```

Responsibilities:

- Validate the existing public manifest.
- Expose generated assets as Vite-managed URLs.
- Serve the development gallery.
- Watch recipe and manifest changes.
- Invalidate the virtual module through HMR.
- Emit generated assets during production builds.
- Warn or fail when required assets are absent or stale.
- Generate virtual-module TypeScript declarations.

The Vite plugin must not:

- Start application backends during `vite build`.
- Authenticate users.
- Seed or reset application data.
- Launch a browser implicitly during ordinary builds.
- Include Playwright or Node-only code in browser bundles.

Capture remains an explicit CLI or CI phase. Production builds consume already generated assets and therefore do not depend on the capture environment.

## 27. Framework consumers

The public manifest is framework-neutral. Any consumer can resolve variants by ID and dimension values.

An optional React helper may expose:

```tsx
<GuideScreenshot
  id="menu.create-recipe.name"
  locale={language}
  theme={resolvedTheme}
  viewport="desktop"
/>
```

The consumer should:

- Select the best exact variant.
- Apply configured fallback rules when permitted.
- Pass manifest alt text to the image.
- Avoid rendering a mismatched language without an explicit fallback policy.
- React to locale and theme changes.
- Preserve intrinsic dimensions to avoid layout shift.

Guide content, CTA behavior, sequencing, and progress remain application-owned.

## 28. CI model

Recommended CI stages:

1. Install dependencies and the pinned browser runtime.
2. Validate recipes and generate the compound schema.
3. Start an isolated documentation environment.
4. Run selected changed captures or the complete matrix.
5. Verify outputs and manifest integrity.
6. Upload private diagnostics for failed jobs.
7. Review and publish generated artifacts according to project policy.

Projects may choose one of three output policies:

- Commit generated assets and verify them in CI.
- Generate assets during a dedicated pre-build CI stage.
- Upload assets to an artifact store or CDN and commit only the manifest.

Ordinary frontend deployment should not be responsible for authenticating and generating screenshots.

## 29. Extensibility contract

Extensions can contribute:

- Scenarios.
- Dimensions.
- Actions.
- Expectations.
- Browser drivers.
- Annotation kinds.
- Renderers.
- Translation providers.
- Artifact stores.
- Reporters.
- Source fingerprint providers.

Each extension declares:

```ts
interface GuideShotExtension {
  name: string
  version: string
  apiVersion: number
  capabilities: string[]
}
```

Extension rules:

- Names are globally namespaced.
- Parameter schemas are mandatory for recipe-facing features.
- Extension versions contribute to relevant cache hashes.
- Capability conflicts fail during configuration.
- Plugin order is deterministic.
- Extensions may not silently rewrite unrelated recipe fields.
- Unknown extension data is rejected.

## 30. Testing the system

The GuideShot packages require:

- Valid and invalid schema fixtures.
- Matrix-expansion and merge-order tests.
- Reference and interpolation tests.
- Cache-hash stability tests.
- Manifest compatibility fixtures.
- Target and action contract tests against a controlled web fixture.
- Renderer visual baselines in a pinned browser environment.
- Privacy-filter tests proving raw pixels are not persisted.
- Atomic-output failure tests.
- Vite integration tests across supported Vite versions.
- At least one non-Vite integration fixture.
- Package-extraction tests that install the published artifacts into a clean project.

## 31. Rejected approaches

### Vite-only engine

Rejected because it prevents reuse in non-Vite applications, documentation services, and remote environments.

### Capture during every Vite build

Rejected because it couples deployment to browsers, authentication, backend health, and deterministic seed data.

### Browser-specific recipe language

Rejected because the public schema must survive a change of browser driver.

### Domain fields in the core schema

Rejected because organization, department, workspace, repository, and similar concepts belong to project scenarios.

### Arbitrary JavaScript in recipes

Rejected because it undermines validation, portability, security, editor support, and caching.

### CSS selectors as the primary contract

Rejected because selectors are fragile across refactors, responsive variants, and translations.

### Hardcoded annotation coordinates

Rejected because coordinates fail when target geometry changes.

### Live-page annotation injection

Rejected because application stacking contexts can affect results and annotation-only changes would require recapture.

### Visual regression as the primary model

Rejected because documentation images and regression baselines have different semantics and review workflows.

### Guide ownership

Rejected because guide sequencing, progress, and completion state are concerns of the consuming product.

## 32. Initial implementation phases

The package family, Changesets-based npm release workflow, and standalone Next.js documentation deployment are implemented. The remaining phases below describe product capability still to be added, not release or deployment prerequisites.

### Phase 1: Portable core and one end-to-end pilot

- Core recipe and manifest schemas.
- Configuration and extension contracts.
- Matrix compiler.
- Playwright Chromium driver.
- Stable target references.
- Standard actions and expectations.
- Viewport and target framing.
- Callout, arrow, spotlight, and outline annotations.
- Offline renderer.
- CLI validation, planning, capture, compose, and verify commands.
- One simple and one authenticated pilot recipe.

### Phase 2: Vite and authoring experience

- Vite virtual manifest and asset emission.
- HMR and staleness reporting.
- Development comparison gallery.
- Headed target inspector.
- Compound project schema generation.
- Source sets and changed-recipe planning.

### Phase 3: Operational hardening

- Pinned CI image.
- Traces and structured diagnostics.
- Privacy classification and redaction policies.
- Artifact-store interface.
- Atomic publication and concurrency controls.
- Magnifier and advanced annotation placement.

### Phase 4: Extraction and ecosystem

- Compatibility fixtures.
- Public adapter authoring documentation.
- Optional React consumer.
- Additional browser driver proof.
- Migration and version-support policy.

## 33. Acceptance criteria for version 1

Version 1 is successful when:

- A single recipe generates all configured locale and theme variants.
- The same core packages work with both a Vite application and a non-Vite URL.
- Authenticated state is prepared entirely through a project scenario.
- All annotations remain attached after locale-dependent layout changes.
- Annotation-only changes recompose without reopening the application.
- Missing, duplicated, hidden, or unstable targets fail with useful diagnostics.
- Sensitive regions are sanitized before cache persistence.
- The public manifest contains no private scenario information.
- Vite production builds consume generated assets without launching a browser.
- CI can reproduce outputs in a pinned environment.
- The generic packages contain no application-domain dependency.

## 34. Final system contract

GuideShot provides:

- One declarative recipe per intended screenshot state.
- Automatic matrix expansion across languages, themes, and other dimensions.
- Real authenticated application scenarios through typed adapters.
- Element-aware framing and annotations.
- Separate capture and composition caches.
- Reproducible regeneration after product changes.
- Portable schemas, manifests, and browser-driver contracts.
- Vite-native consumption without Vite lock-in.

The recipe is the durable visual specification. The browser capture is an intermediate scene. The annotated image is a generated artifact. The consuming guide remains application-owned.
