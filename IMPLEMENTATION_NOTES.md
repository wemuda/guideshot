# GuideShot implementation notes

Status: Phase 1 vertical slice implemented

This file records implementation-level takeaways that complement `SPEC.md`. It
should capture decisions, not duplicate the full product specification.

## Settled baseline from the specification

- GuideShot is a TypeScript package family targeting Node.js 20.5 or newer.
- The authoritative interfaces are a CLI and Node.js library; Vite integration
  is a thin consumer and never performs implicit capture during a normal build.
- Recipes are strict, portable, non-executable data. JSON is canonical and JSONC
  is an authoring convenience.
- JSON Schema Draft 2020-12 is the public contract, with validation at core,
  extension, and resolved-job levels.
- Application-specific authentication, data setup, dimensions, actions, and
  readiness logic live in typed project adapters rather than the recipe schema.
- Chromium through Playwright Library is the first browser implementation, but
  browser-facing contracts remain driver-neutral.
- Capture and annotation composition are separate phases with independent cache
  identities. Persisted scenes must already be privacy-sanitized.
- Outputs and manifest entries are deterministic and are published
  transactionally; partial runs do not silently publish a partial manifest.
- Phase 1 is the first implementation target unless kickoff scope says
  otherwise. Later-phase features should have compatible seams but need not be
  implemented prematurely.

## Confirmed kickoff decisions

- Use `pnpm` workspaces, TypeScript strict mode, ESM, Node.js 20+, Vitest,
  ESLint, Prettier, and Changesets.
- Build a self-contained React site in this repository that acts as the
  GuideShot homepage, documentation, and demo/pilot application. Structure it
  for later hosting, but do not choose or configure a hosting provider until
  deployment is requested.
- The React site is distinct from the optional `@guideshot/react` framework
  consumer package described in the specification.
- GuideShot is intended to be open source under the MIT license.
- Target macOS and Linux. Windows is not part of the initial support contract.
- Retain the specification's `@guideshot/*` package-family naming unless package
  registry availability or publication setup requires a later change.

## Implemented decisions

- The workspace contains `schema`, `core`, `playwright`, `renderer`, and `cli`
  packages plus the React pilot site. Empty future-package shells were not
  created.
- Phase 1 recipes publish one canonical PNG or WebP asset per variant. Multiple
  source formats remain a later manifest-contract decision.
- Targets whose identity starts with `privacy.` are masked in Chromium before
  screenshot bytes leave the driver. The cache independently rejects scenes
  that are not explicitly sanitized or whose pixels do not match their hash.
- Custom `invoke` actions are deferred until there is a real typed registration
  and execution contract; the Phase 1 schema rejects them.
- The pilot owns two recipes: a simple sign-in state and an authenticated recipe
  dialog prepared entirely by a scenario. English and Danish across light and
  dark themes produce eight committed 1200 by 900 WebP assets.
- The site imports the committed public manifest at build time. Its ordinary
  production build does not start an application server, prepare a scenario, or
  open a browser.
- Generated assets are immutable and content-addressed. Publication stages all
  selected outputs and renames the public manifest last.

## Verified boundaries

- Validation and planning have no browser, server, scenario, dimension, or
  renderer side effects.
- Capture uses one browser run with a fresh context for every job.
- Composition succeeds from sanitized cache data while the application server
  is unavailable.
- Missing, duplicate, hidden, and unstable targets have stable diagnostics.
- The public manifest contains only public recipe, variant, asset, hash,
  dimension, format, and accessibility data.
- The same driver contracts are exercised against the Vite pilot and a
  controlled Node HTTP fixture.

## Deliberate deferrals

- Vite virtual modules and HMR, React consumers, inspectors, galleries,
  source-set fingerprints, custom actions, advanced privacy policies, traces,
  concurrency controls, migration tooling, and additional browser drivers stay
  in later phases.
- No package release or site deployment is part of this implementation. Those
  remain explicit follow-up operations.
