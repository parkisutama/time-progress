<!--
Title: use a Conventional Commits header, for example "fix(events): keep stored events after a failed read".
Reviewers: write comments as Conventional Comments and mark issue, todo, and suggestion as blocking or non-blocking.
Formats: docs/reference/change-management.md
-->

## Summary

<!-- The user or engineering outcome, and why this approach was chosen. -->

## Decisions and records

- ADRs followed or affected: <!-- ADR-NNN, or none -->
- SPEC and acceptance criteria covered: <!-- SPEC-NNN AC-n, or none -->
- [ ] No decision that meets an ADR trigger is made without an accepted ADR.
- [ ] No `proposed` ADR is implemented.

## Change impact

- Version impact: <!-- none, PATCH, MINOR, or MAJOR -->
- [ ] Breaking changes carry a `BREAKING CHANGE:` footer and a `**Breaking:**` changelog entry with migration steps.
- [ ] `CHANGELOG.md` is updated under `Unreleased`, or the omission is explained here.

## Tests

- [ ] New or changed behavior has tests that fail without this change.
- [ ] Bug fixes include a regression test.
- [ ] No test or assertion was removed, skipped, or weakened.

<!-- List the tests added, and any acceptance verified manually. -->

## Risk and security

- [ ] External input and stored data are validated at their trust boundaries.
- [ ] Failed validation of stored data cannot overwrite or delete stored data.
- [ ] Authentication and authorization behavior is unchanged, or the change is described above.
- [ ] No secrets, credentials, or personal production data are included.
- [ ] Dependency and lockfile changes were reviewed.

## Verification

- [ ] `bun run verify`
- [ ] `git diff --check`

## Documentation

- [ ] Documents made stale by this change are updated (README, reference, threat model, indexes).
- [ ] New documents declare audience and Diátaxis type.
- [ ] If `AGENTS.md` changed, `.github/copilot-instructions.md` is updated.

## Scope

<!-- Intentionally deferred work, and unrelated areas that were not changed. -->
