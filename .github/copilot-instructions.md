---
title: Copilot Instructions
created: 2026-09-17T01:50
modified: 2026-09-17T02:45
audience: GitHub Copilot and other AI coding agents
content_type: reference
tags:
  - ai-assisted
  - governance
---

# Copilot instructions

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

This is a digest of the repository-root [`AGENTS.md`](../AGENTS.md), which you MUST read before suggesting or changing code.
If this digest and `AGENTS.md` disagree, `AGENTS.md` wins; report the mismatch.

## Before you change anything

- Read [`docs/ADR/README.md`](../docs/ADR/README.md) and every accepted or proposed ADR for the affected area.
- Follow accepted ADRs. Do not implement proposed ADRs.
- Do not decide silently on authentication, persistence, public contracts, dependencies, runtime, deployment, or repository standards.
  Draft a `proposed` ADR with real options and ask a human to decide.

## Security

- Every `/events` endpoint MUST require an authenticated user and MUST scope storage to that identity.
- External input and stored data MUST be validated with strict Valibot schemas.
- A failed validation of stored data MUST NOT cause stored data to be overwritten or deleted.
- Secrets, credentials, and production personal data MUST NOT be committed.
- `DEV_BYPASS_EMAIL` MUST NOT be configured outside a local `.dev.vars` file.

## Code and tests

- Bug fixes start with a failing test that reproduces the bug.
- Unit and integration tests use Arrange-Act-Assert with one Act per test.
- Acceptance criteria use Given-When-Then with `AC-n` identifiers referenced in test names.
- Tests MUST NOT be deleted, skipped, or weakened to make a check pass.
- Run `bun run verify` and `git diff --check`.

## Commits, reviews, and releases

- Commit messages follow [Conventional Commits 1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/); breaking changes MUST include a `BREAKING CHANGE:` footer even with `!`.
- Explain why in the commit body and link records with `Refs: ADR-NNN, SPEC-NNN`.
- Review comments use [Conventional Comments](https://conventionalcomments.org/) and mark `issue`, `todo`, and `suggestion` as `blocking` or `non-blocking`.
- Notable changes update `CHANGELOG.md` under `Unreleased` following [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
- Versions follow [Semantic Versioning 2.0.0](https://semver.org/).
- Do not push, merge, deploy, tag, or release without explicit human authorization.

## Documentation

- Identify the audience and the [Diátaxis](https://diataxis.fr/) type before writing.
- Follow [documentation standards](../docs/reference/documentation-standards.md) for portable Markdown and keyword use.
