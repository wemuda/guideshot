# @guideshot/cli

The GuideShot command-line and programmatic orchestration layer for planning, capture, offline composition, and artifact verification.

```sh
pnpm add -D @guideshot/cli
pnpm exec guideshot validate
pnpm exec guideshot capture --concurrency 4
pnpm exec guideshot verify
```

```ts
import { createGuideShotService } from '@guideshot/cli';

const report = await createGuideShotService({ cwd: process.cwd() }).plan();
```

Set `capture.concurrency` in `guideshot.config.ts` for a project default or pass `--concurrency` for a one-run override. Stateful scenarios may share a `concurrencyKey` to remain exclusive.

Requires Node.js 20.5 or newer. Licensed under the MIT License.
