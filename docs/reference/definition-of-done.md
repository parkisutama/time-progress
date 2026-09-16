---
title: Definition of Done
created: 2026-09-17T01:50
modified: 2026-09-17T01:50
audience: contributors and reviewers
content_type: reference
tags:
  - engineering
  - reference
---

# Definition of done

Audience: contributors and reviewers.

A change is complete only when all applicable items are satisfied.

## Correctness

- Behavior matches the approved task or specification.
- Error and boundary cases are covered by tests.
- No unrelated behavior changes are mixed into the change.

## Quality

- `bun run lint`, `bun run check`, `bun run test`, and `bun run build` pass.
- Names, types, and module boundaries make the change understandable without author explanation.
- Dead code and unnecessary dependencies are not introduced.

## Security

- Trust boundaries are identified and external input is validated.
- Authentication and authorization checks remain enforced.
- `bun audit` has no unmitigated findings.
- Staged changes contain no credentials, tokens, private keys, or production personal data.

## Delivery

- Relevant ADRs were read before implementation and new architectural decisions are recorded in `docs/ADR/`.
- Significant behavior or contract changes have an approved specification in `docs/SPEC/`.
- Notable changes are recorded under `Unreleased` in `CHANGELOG.md`.
- Documentation identifies its audience and follows one Diátaxis content type.
- `git diff --check` passes and the staged diff matches the intended scope.
- Commits are atomic, follow Conventional Commits 1.0.0-beta.4, and are independently understandable.
- Platform-specific or human acceptance is recorded separately from automated checks.
- Push, merge, deployment, and other external mutations occur only with explicit authorization.
