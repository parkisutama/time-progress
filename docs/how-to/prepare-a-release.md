---
title: How to Prepare a Release
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers and release managers
content_type: how-to
tags:
  - releases
  - versioning
  - how-to
---

# How to prepare a release

This guide produces a versioned, tagged release with a matching changelog entry.

## Before you start

- A maintainer has authorized the release.
- The public contract is declared in an accepted ADR-004.
- `main` passes CI.

## Steps

1. Update your local `main` and confirm the working tree is clean.

    ```bash
    git switch main
    git pull --ff-only
    git status --short
    ```

2. List the changes since the previous release, including breaking-change footers.

    ```bash
    git log --format='%h %s%n%b' v0.1.0..HEAD
    ```

    For the first release, omit the range.

3. Choose the version increment from [the increments table](../reference/change-management.md#increments).
    Any `BREAKING CHANGE:` footer determines the increment regardless of commit type.

4. Compare the `Unreleased` section of `CHANGELOG.md` with the log, and add any notable change that is missing.

5. Set the new version in `package.json`.

6. In `CHANGELOG.md`, rename `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD`, add a new empty `## [Unreleased]` above it, and update the link references at the end of the file.

    ```text
    [Unreleased]: https://github.com/parkisutama/time-progress/compare/vX.Y.Z...HEAD
    [X.Y.Z]: https://github.com/parkisutama/time-progress/compare/vPREVIOUS...vX.Y.Z
    ```

7. Run the full verification.

    ```bash
    bun run verify
    ```

8. Commit the release.

    ```bash
    git commit -am "chore(release): vX.Y.Z"
    ```

9. Create an annotated tag.

    ```bash
    git tag -a vX.Y.Z -m "vX.Y.Z"
    ```

10. Push the commit and the tag, and deploy, only if the maintainer has authorized each of those steps.

    ```bash
    git push origin main vX.Y.Z
    ```

## If a release must be withdrawn

Leave the tag and the changelog section in place, append ` [YANKED]` to the version heading, and ship the correction as a new version.
