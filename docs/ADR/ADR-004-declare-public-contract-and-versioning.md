---
title: "ADR-004: Declare Public Contract and Versioning"
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers, release managers, and AI coding agents
content_type: explanation
status: proposed
date: 2026-09-17
decision-makers: []
consulted:
  - AI coding agent (governance audit, 2026-09-17)
informed: []
supersedes: []
superseded-by: []
tags:
  - architecture
  - decision
  - versioning
  - contracts
---

# ADR-004: Declare the public contract and versioning

## Summary

In the context of releasing Progressive Time with Semantic Versioning,
facing an undeclared public API, a `0.0.1` version that was never released, and pending changes to authentication and persistence,
we propose declaring the `/events` HTTP contract and the persisted data formats as the public contract and releasing `0.1.0` as the first version
and neglect releasing `1.0.0` now and not versioning releases,
to achieve version numbers that tell users and a future desktop client whether stored data and the API stay compatible,
accepting that `1.0.0` is deferred until ADR-002 and ADR-003 are implemented.

## Context and problem statement

- Semantic Versioning 2.0.0 requires software that uses it to declare a public API, in code or in documentation.
- `package.json` declares version `0.0.1`, and the repository has no release tags.
- The application runs in production on Cloudflare Workers; Semantic Versioning's FAQ says software used in production should probably already be `1.0.0`.
- Although the browser client ships with the server, previously stored data persists across deployments: KV records and `localStorage` records written by older versions are read by newer versions.
- A planned desktop edition would be a second consumer of the same data.
- ADR-002 and ADR-003 propose changes that alter HTTP responses (401 cases, write refusals).

What is the public contract, and which version should the first release carry?

## Decision drivers

- Users must be able to tell from the version whether an upgrade can affect their stored data.
- Version numbers follow Semantic Versioning 2.0.0 precisely.
- Known contract changes are pending.
- Release overhead stays small for a single-maintainer project.

## Considered options

1. Declare the public contract and release `0.1.0`; release `1.0.0` after ADR-002 and ADR-003 are implemented.
2. Declare the public contract and release `1.0.0` now.
3. Do not version releases; describe changes by date only.

## Decision outcome

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" in this section are to be interpreted as described in BCP 14 (RFC 2119, RFC 8174) when, and only when, they appear in all capitals, as shown here.

Proposed option: 1, because it declares the contract now while signaling that the pending authentication and persistence changes may still break it.

The public contract consists of:

- `/events` HTTP methods, request bodies, response bodies, and status codes;
- the Workers KV key format `events:<email>` and the stored event record schema;
- the browser `localStorage` key `tp:events:v1` and its record schema.

The user interface, component structure, and internal modules are not part of the public contract.

- The first release MUST be `0.1.0`.
- Changes to the public contract MUST be versioned as defined in [Change management](../reference/change-management.md#versions).
- A change to a persisted data format MUST include a migration for data written by earlier versions, or be declared as breaking.
- `1.0.0` SHOULD be released once ADR-002 and ADR-003 are implemented and the contract is stable.

### Consequences

- Good, because stored data formats become explicit, so changes to them are reviewed as contract changes.
- Good, because the first changelog release gives future readers a baseline.
- Bad, because `0.y.z` versions signal instability to users for longer.
- Neutral, because the `localStorage` key already carries a format version (`v1`) that can be used for migrations.

### Confirmation

- Review checks that every change to the listed contract elements carries a version impact, a changelog entry, and a `BREAKING CHANGE:` footer when incompatible.
- Schema tests in `src/lib/event-schema.test.ts` detect unintended changes to the record schema.

## Pros and cons of the options

### Release 0.1.0 first

- Good, because pending breaking changes do not force a `2.0.0` soon after `1.0.0`.
- Bad, because it postpones the stability signal for a production application.

### Release 1.0.0 now

- Good, because it matches Semantic Versioning's guidance for software already in production.
- Bad, because the proposed changes in ADR-002 and ADR-003 would likely require `2.0.0` shortly afterwards.

### No versioning

- Good, because it has no release overhead.
- Bad, because it contradicts the repository's adopted standards and gives users no compatibility signal.

## More information

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
- [How to prepare a release](../how-to/prepare-a-release.md)
- Reopen when a second client (such as the desktop edition) consumes the contract, or before releasing `1.0.0`.
