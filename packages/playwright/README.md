# @guideshot/playwright

The Chromium capture driver for GuideShot, built on Playwright Library.

```sh
pnpm add @guideshot/playwright playwright
pnpm exec playwright install chromium
```

```ts
import { playwrightDriver } from '@guideshot/playwright';

const driver = playwrightDriver({ timeoutMs: 15_000 });
```

Requires Node.js 20 or newer. Licensed under the MIT License.
