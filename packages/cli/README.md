# @guideshot/cli

The GuideShot command-line and programmatic orchestration layer for planning, capture, offline composition, and artifact verification.

```sh
pnpm add -D @guideshot/cli
pnpm exec guideshot validate
pnpm exec guideshot capture
pnpm exec guideshot verify
```

```ts
import { createGuideShotService } from '@guideshot/cli';

const report = await createGuideShotService({ cwd: process.cwd() }).plan();
```

Requires Node.js 20 or newer. Licensed under the MIT License.
