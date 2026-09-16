---
title: Pull Request Template
created: 2026-09-17T01:50
modified: 2026-09-17T01:50
audience: contributors and reviewers
content_type: reference
tags:
  - engineering
  - governance
---

## What and why

<!-- Describe the user or engineering outcome and why this approach was chosen. -->

## Risk and security

- [ ] External input and stored data are validated at their trust boundaries.
- [ ] Authentication and authorization behavior is unchanged, or the change is explicitly described.
- [ ] No secrets, credentials, or personal production data are included.
- [ ] Dependency and lockfile changes were reviewed.

## Verification

- [ ] `bun run verify`
- [ ] `git diff --check`
- [ ] Manual or platform-specific acceptance is documented when relevant.

## Scope

<!-- List intentionally deferred work and unrelated areas not changed. -->

## Documentation and release impact

- [ ] Relevant ADRs were reviewed; a new ADR was added if this changes architecture, domain rules, or durable contracts.
- [ ] An approved `docs/SPEC/` document exists when behavior or acceptance criteria changed.
- [ ] Documentation states its persona and Diátaxis content type.
- [ ] `CHANGELOG.md` was updated for a notable change, or the omission is explained.
- [ ] The SemVer impact is identified: none, PATCH, MINOR, or MAJOR.
