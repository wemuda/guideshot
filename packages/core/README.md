# @guideshot/core

The portable GuideShot compiler: configuration contracts, recipe discovery, deterministic planning, resolution, diagnostics, hashing, and manifests.

```sh
pnpm add @guideshot/core
```

```ts
import { parseRecipe } from '@guideshot/core';

const recipe = parseRecipe(source, { file: 'example.shot.json' });
```

Browser drivers and annotation renderers are injected through `defineConfig`. Requires Node.js 20 or newer and is licensed under the MIT License.

Scenario definitions remain isolated per job by default. Deterministic, read-only adapters may set `reusePreparedState: true`; shared mutable adapters should use `concurrencyKey` instead.
