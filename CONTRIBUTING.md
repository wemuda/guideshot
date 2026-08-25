# Contributing to GuideShot

Thanks for helping make reproducible documentation screenshots portable and safe. GuideShot is an MIT-licensed TypeScript workspace managed with pnpm.

## Set up

The reusable packages support Node.js 20 or newer. The workspace pins Node.js
22.18 for scripts; pnpm 10.14 or newer downloads it automatically during
`pnpm install`. If you use a version manager, load the version in `.nvmrc`.

```sh
pnpm install
pnpm --filter @guideshot/playwright exec playwright install chromium
pnpm build
pnpm test
```

Use macOS or Linux for Phase 1 development. Windows is not yet part of the support contract.

## Before opening a pull request

Run:

```sh
pnpm build
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```

Browser tests require the Playwright Chromium installed above. You can target one workspace while iterating:

```sh
pnpm --filter @guideshot/core test
pnpm --filter @guideshot/playwright typecheck
pnpm --filter @guideshot/site dev
```

Do not commit `dist`, caches, run diagnostics, credentials, `.env` files, or real authenticated browser state.

## Architecture boundaries

- `@guideshot/schema` owns public JSON contracts and inferred types. Schema changes require valid and invalid fixtures.
- `@guideshot/core` stays browser-, framework-, and application-independent.
- `@guideshot/playwright` implements capture through core driver contracts.
- `@guideshot/renderer` consumes sanitized core scenes and must remain isolated from the live application and network.
- `@guideshot/cli` owns orchestration; command entry points should remain thin over testable TypeScript services.
- `apps/site` is the public site and deterministic pilot, never a dependency of a generic package.

Recipes are strict data. Application-specific authentication, tenants, feature flags, data setup, and custom behavior belong in reviewed TypeScript adapters. Avoid domain-specific fields in the public recipe schema.

## Testing changes

Add the narrowest test that proves the contract:

- Schema changes: valid and invalid conformance fixtures.
- Core changes: deterministic matrix, interpolation, hash-boundary, diagnostics, manifest, or safety tests.
- Driver changes: controlled-page contract tests for targets, actions, expectations, readiness, framing, and context isolation.
- Renderer changes: deterministic layout tests and a pinned-browser composition test.
- CLI changes: command-service tests, failure-path cleanup, cache behavior, and publication integrity.
- Site changes: typecheck, build, and smoke coverage for the affected pilot route.

Never use live customer data in a fixture. Synthetic values should be obviously invalid outside the test environment.

## Commits and changesets

Use conventional commit messages, for example:

```text
feat(core): add matrix exclusion diagnostics
fix(renderer): keep callouts inside the safe area
docs: clarify scenario privacy boundary
```

Add a Changeset for a user-visible package change. Documentation-only, test-only, and private site changes generally do not require one.

## Pull requests

Keep pull requests focused and explain:

- The observable behavior being changed.
- Which package owns the change and why.
- How determinism, caching, security, or privacy is affected.
- The tests used to verify it.
- Any intentionally deferred follow-up.

Public API changes should remain compatible with the driver-neutral core contracts. A recipe or manifest schema change must be treated as a versioned public-contract decision, not an incidental implementation detail.

## Security reports

Do not open a public issue containing credentials, authenticated traces, private screenshots, or an exploitable vulnerability. Use the repository's private security-reporting channel and include the smallest synthetic reproduction possible.
