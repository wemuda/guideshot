# @guideshot/renderer

A deterministic, network-disabled Chromium compositor for GuideShot annotations, PNG, and WebP assets.

```sh
pnpm add @guideshot/renderer playwright
pnpm exec playwright install chromium
```

```ts
import { htmlRenderer } from '@guideshot/renderer';

const renderer = htmlRenderer();
```

Renderer runs reuse network-disabled Chromium pages across compositions while keeping concurrent work in separate browser contexts.

Requires Node.js 20 or newer. Licensed under the MIT License.
