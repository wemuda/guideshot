# Releasing GuideShot

GuideShot publishes `@guideshot/schema`, `@guideshot/core`, `@guideshot/playwright`, `@guideshot/renderer`, and `@guideshot/cli` to npm. The site and UI workspace packages are private and are never included in a release.

## Prepare a release

Add a changeset with the product change:

```sh
pnpm changeset
```

Choose the affected packages, select the appropriate semantic version bump, and describe the user-visible change. Commit the generated file with the implementation.

After that change reaches `main` and CI succeeds, the Release workflow opens or updates `chore: version packages`. Merging that version pull request runs CI again, then publishes the exact package versions to npm and creates matching Git tags and GitHub releases.

## Security model

- npm trusts only `.github/workflows/release.yml` in `wemuda/guideshot` through GitHub OIDC.
- The publish path runs only after a successful CI push on `main`, inside the `npm` GitHub environment.
- Release artifacts are built in an unprivileged job and passed to the short-lived publish job.
- No npm token is stored in GitHub.
- `NPM_TRUSTED_PUBLISHING_READY` is the repository-level release kill switch.
- Release Actions are pinned by commit and updated through Dependabot.

## Useful commands

```sh
pnpm release:status
pnpm release:version
pnpm pack:check
```

Versioning and publishing normally belong to GitHub Actions. Run `pnpm release:publish` locally only for registry bootstrap or recovery.
