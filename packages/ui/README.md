# @guideshot/ui

Shared UI foundation for GuideShot's website, documentation, examples, and
capture fixtures. It is duplicated from Infood's mature shared UI package and
adapted as the only visual foundation in this repository.

The package implements the canonical GuideShot visual language through semantic
tokens, accessible primitives, and application-independent composition. Exact
fonts, colors, spacing, radii, and motion live in the token source rather than
being repeated here.

## Boundary

This package owns design tokens, base styles, reusable UI primitives, and application-independent layout patterns. Frontends continue to own routing, authentication, API integration, translated copy, navigation configuration, permissions, and domain workflows.

## Usage

```tsx
import { Button } from '@guideshot/ui/components/button'
import '@guideshot/ui/globals.css'
```

`globals.css` is the canonical token and Tailwind CSS 4 contract. Start with the
[agent design entrypoint](docs/agent-index.md), then use the
[design principles](docs/design-principles.md),
[canonical examples](docs/canonical-examples.md), and relevant pattern guide.
Use the [component dos and don'ts](docs/component-dos-and-donts.md) as the
component-choice and review reference.
The [design tokens](docs/design-tokens.md),
[iconography](docs/iconography.md), [core primitives](docs/core-primitives.md),
[data display foundations](docs/data-display.md),
[shell and layout primitives](docs/shell-layout.md), and
[migration governance](docs/migration-governance.md) remain canonical. The
GuideShot website's application-owned decisions live in
[`apps/site/docs/ui-profile.md`](../../apps/site/docs/ui-profile.md).

Add shadcn components from the repository root:

```bash
pnpm dlx shadcn@latest add <component> --cwd packages/ui
```

Validate the package:

```bash
pnpm --filter @guideshot/ui typecheck
pnpm --filter @guideshot/ui lint
```

Future replacement work follows the behavior-parity and ownership gates in
`docs/migration-governance.md`.
