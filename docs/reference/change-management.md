---
title: Change Management
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: contributors, reviewers, release managers, and AI coding agents
content_type: reference
tags:
  - git
  - review
  - changelog
  - versioning
  - reference
---

# Change management

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

This reference defines commit messages, review comments, changelog entries, and version numbers.

| Artifact | Standard | Pinned version |
| --- | --- | --- |
| Commit message | [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) | 1.0.0-beta.4 |
| Review comment | [Conventional Comments](https://conventionalcomments.org/) | Current site |
| Changelog | [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) | 1.1.0 |
| Version number | [Semantic Versioning](https://semver.org/) | 2.0.0 |

Changing a pinned version is a repository standard change and requires an ADR.

## Commit messages

### Commit structure

```text
<type>[(<scope>)][!]: <description>

[body]

[footers]
```

- `type` and `description` are REQUIRED, separated by a colon and a space.
- `description` SHOULD be an imperative, lowercase summary without a trailing period.
- `scope` is OPTIONAL and names the affected area: `events`, `auth`, `time`, `ui`, `deps`, `ci`, `docs`, `adr`, `spec`, or `release`.
- The body starts after one blank line and explains why the change was made and what was considered.
- The body is REQUIRED for `feat`, `fix`, `security`, `perf`, breaking changes, and commits that implement or supersede an ADR.
- Footers start after one blank line.
- `BREAKING CHANGE: <description>` MUST appear, in uppercase, in the body or footer of every breaking change, including when `!` is used.
- `Refs: <identifiers>` SHOULD list related records, such as `Refs: ADR-002, SPEC-001, #14`.
- Tool-added trailers, such as `Co-Authored-By:`, come last.

Under 1.0.0-beta.4, `!` only draws attention to a breaking change; the `BREAKING CHANGE:` text is still required.

### Types

| Type | Use for | Changelog group | Version impact |
| --- | --- | --- | --- |
| `feat` | A new capability visible to users or operators | Added | MINOR |
| `fix` | A bug fix | Fixed | PATCH |
| `security` | A vulnerability fix or security hardening | Security | PATCH |
| `perf` | A performance improvement without behavior change | Changed, when noticeable | PATCH |
| `refactor` | A code change without behavior change | None | None |
| `test` | Tests only | None | None |
| `docs` | Documentation only | None, unless it documents a changed contract | None |
| `build` | Build system, dependencies, or runtime requirements | Changed, when requirements change | PATCH or none |
| `ci` | CI configuration | None | None |
| `chore` | Maintenance that fits no other type | None | None |
| `revert` | Reverting an earlier commit; the body names the reverted hash | Mirrors the reverted change | Mirrors the reverted change |

Any type with `BREAKING CHANGE:` is a MAJOR change from `1.0.0`, and a MINOR change before `1.0.0`.

### Examples

```text
security(auth): accept the development bypass only on loopback hosts

The bypass email was honored for any hostname, so a deployed Worker
with DEV_BYPASS_EMAIL configured would authenticate every request.

Refs: ADR-002
```

```text
docs(adr): propose ADR-003 store events per identity in KV

Records the current persistence design and the data-loss defect found
during the governance audit so that a maintainer can decide the fix.

Refs: ADR-003
```

## Review comments

Review comments from humans and agents follow Conventional Comments.

### Format

```text
<label> [(<decorations>)]: <subject>

[discussion]
```

### Labels

| Label | Use for |
| --- | --- |
| `praise` | Something worth keeping or repeating |
| `issue` | A concrete problem; pair it with a suggested resolution |
| `todo` | A small, necessary change |
| `suggestion` | A proposed improvement, with the reason |
| `question` | A request for clarification when relevance is uncertain |
| `nitpick` | A trivial preference; always non-blocking |
| `thought` | An idea for later; always non-blocking |
| `note` | Information the author should know; non-blocking |

### Decorations

| Decoration | Meaning |
| --- | --- |
| `blocking` | MUST be resolved before merge |
| `non-blocking` | Does not prevent merge |
| `if-minor` | Resolve only if the change is small |
| `security` | Concerns a trust boundary, secret, or vulnerability |

- `issue`, `todo`, and `suggestion` MUST carry `blocking` or `non-blocking`.
- A comment that asks for a decision covered by an ADR trigger SHOULD link a proposed ADR instead of deciding in the thread.

```text
issue (blocking, security): POST replaces stored events after a failed read

`getList` returns an empty list when any stored record is invalid, and
`setList` then writes a one-item list. Refuse the write and add a
regression test.
```

## Changelog

`CHANGELOG.md` is written for people, not generated from commits.

### Changelog structure

- `## [Unreleased]` is always the first section.
- Releases follow, newest first, as `## [X.Y.Z] - YYYY-MM-DD`.
- A withdrawn release is marked `## [X.Y.Z] - YYYY-MM-DD [YANKED]` and is never removed.
- Groups appear in this order and only when non-empty: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Link reference definitions at the end of the file make every version heading a link.

```text
[Unreleased]: https://github.com/parkisutama/time-progress/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/parkisutama/time-progress/releases/tag/v0.1.0
```

Before the first release, `[Unreleased]` links to the commit history of `main`.

### Entries

- Notable changes MUST be added under `Unreleased` in the same change.
- Notable means visible to users or operators, a changed requirement, a security fix, a deprecation, or a breaking change.
- Each entry describes the impact on the reader, not the implementation or the commit message.
- A breaking entry starts with `**Breaking:**` and states the migration.
- A feature MUST be listed under `Deprecated` in at least one release before it appears under `Removed`.
- Refactors, test-only, and CI-only changes are omitted.

## Versions

### Public contract

Semantic Versioning measures changes against a declared public API.
The public contract is declared in ADR-004.
Until ADR-004 is decided, these are treated as public:

- `/events` HTTP methods, request bodies, response bodies, and status codes;
- the Workers KV key format and the stored event record schema;
- the browser `localStorage` key and its stored record schema.

The user interface layout is not part of the contract.

### Increments

| Stage | Change | Increment |
| --- | --- | --- |
| Before `1.0.0` | Backward-compatible fix | PATCH |
| Before `1.0.0` | New capability or breaking change | MINOR |
| From `1.0.0` | Backward-compatible fix | PATCH |
| From `1.0.0` | Backward-compatible capability or deprecation | MINOR |
| From `1.0.0` | Breaking change | MAJOR |

Semantic Versioning allows anything to change in `0.y.z`; the pre-`1.0.0` rows above are this repository's stricter policy.
Security fixes use PATCH unless they require a breaking change.

### Version identifiers

- The version is the `version` field in `package.json`.
- A release is tagged with an annotated Git tag `vX.Y.Z`; the `v` prefix is a tag convention, not part of the version.
- Pre-releases use `X.Y.Z-rc.N`.
- Build metadata (`+…`) is ignored for precedence and SHOULD NOT be used.
- A released version MUST NOT be changed; corrections ship as a new version.
