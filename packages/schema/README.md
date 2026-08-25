# @guideshot/schema

Portable TypeScript types and JSON Schema Draft 2020-12 contracts for GuideShot recipes and public manifests.

```sh
pnpm add @guideshot/schema
```

```ts
import { RecipeSchema, writeSchemas, type Recipe } from '@guideshot/schema';

await writeSchemas('.guideshot/schemas');
```

Requires Node.js 20 or newer. Licensed under the MIT License.
