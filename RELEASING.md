# Releasing GuideShot

GuideShot publishes `@guideshot/schema`, `@guideshot/core`, `@guideshot/playwright`, `@guideshot/renderer`, and `@guideshot/cli` to npm. The site and UI workspace packages are private and are never included in a release.

## Prepare a release

Add a changeset with the product change:

```sh
pnpm changeset
```

Choose the affected packages, select the appropriate semantic version bump, and describe the user-visible change. Commit the generated file with the implementation.

After that change reaches `main` and CI succeeds, the same run opens or updates `chore: version packages`. The generated version pull request skips duplicate CI. Merging it starts a short metadata check, which dispatches the trusted Release workflow to publish the exact package versions to npm and create matching Git tags and GitHub releases.

## Security model

- npm trusts only `.github/workflows/release.yml` in `wemuda/guideshot` through GitHub OIDC.
- Normal changes run full CI on their pull request and exact merged commit. Generated version commits bypass the full browser suite only when every changed path is release metadata.
- CI dispatches the trusted Release workflow only after recognizing a generated version commit on `main`; manual dispatch remains available for recovery.
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
