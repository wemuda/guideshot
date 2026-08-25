# GuideShot implementation notes

Status: kickoff decisions in progress

This file records implementation-level takeaways that complement `SPEC.md`. It
should capture decisions, not duplicate the full product specification.

## Settled baseline from the specification

- GuideShot is a TypeScript package family targeting Node.js 20 or newer.
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

## Remaining kickoff decisions

1. Delivery scope: implement Phase 1 as a working vertical slice, or first turn
   the draft into a more detailed normative specification and execution plan.
2. Package topology: create the Phase 1 packages plus the React site now, or
   also create empty workspace boundaries for later Vite and React packages.
3. Phase 1 annotation fidelity: accept a deterministic functional renderer
   first, or require production-quality visual design and bundled brand assets
   in the initial milestone.

## Defaults for remaining decisions

- Implement Phase 1 as a working vertical slice.
- Scaffold the Phase 1 packages (`schema`, `core`, `playwright`, `renderer`, and
  `cli`) plus the React site; defer empty `vite` and `react` package shells.
- Use the React site for one unauthenticated and one deterministic
  fixture-authenticated recipe as end-to-end acceptance fixtures.
- Make renderer output polished enough for the public demo while prioritizing a
  deterministic, well-tested composition contract over a final brand system.
- Treat Phase 1 as a publishable-quality API foundation but do not publish a
  release until the vertical slice and compatibility fixtures pass.
