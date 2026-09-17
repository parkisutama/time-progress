---
title: Definition of Done
created: 2026-09-17T01:50
modified: 2026-09-17T02:45
audience: contributors, reviewers, and AI coding agents
content_type: reference
tags:
  - engineering
  - quality
  - reference
---

# Definition of done

A change is done when every applicable item below is true.
Each item links to the reference that defines it.

## Correctness

- Behavior matches the approved SPEC or task, and every affected `AC-n` has a verifying test or recorded manual acceptance.
- Boundary and error cases are covered as required by [Testing conventions](testing-conventions.md#required-coverage).
- A bug fix includes a regression test that fails without the fix.
- No unrelated behavior change is mixed into the change.

## Quality

- `bun run verify` passes.
- Names, types, and module boundaries make the change understandable without the author's explanation.
- No dead code or unnecessary dependency is introduced.

## Security

- Trust boundaries are identified and external input is validated.
- Authentication and authorization checks remain enforced.
- Failed validation of stored data never overwrites or deletes stored data.
- `bun audit` has no unmitigated findings.
- The staged diff contains no credentials, tokens, private keys, or production personal data.

## Decisions and records

- Relevant ADRs were read before implementation.
- Every decision that meets an ADR trigger has an accepted ADR; no `proposed` ADR is implemented.
- Commits that relate to a record include a `Refs:` footer.
- The [threat model](../explanation/threat-model.md) reflects new risks, controls, or known defects.

## Documentation

- Documents touched by the change are still accurate.
- New documents declare audience and Diátaxis type in frontmatter and follow [Documentation standards](documentation-standards.md).
- `docs/index.md` and `docs/ADR/README.md` list new or changed documents.
- If `AGENTS.md` changed, `.github/copilot-instructions.md` was updated in the same commit.

## Delivery

- Notable changes are recorded under `Unreleased` in `CHANGELOG.md`, and the version impact is stated in the pull request.
- Commits are atomic and follow [Change management](change-management.md#commit-messages).
- Review comments are resolved; no `blocking` comment remains open.
- `git diff --check` passes and the staged diff matches the intended scope.
- Platform or human acceptance is recorded separately from automated checks.
- Push, merge, tag, release, and deployment happen only with explicit authorization.
