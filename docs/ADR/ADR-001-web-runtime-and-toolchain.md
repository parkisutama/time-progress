---
title: "ADR-001: Web runtime and toolchain"
created: 2026-09-17T02:00
modified: 2026-09-17T02:00
audience: maintainers, contributors, reviewers, and AI coding agents
content_type: explanation
tags:
  - architecture
  - runtime
  - toolchain
---

# ADR-001: Web runtime and toolchain

Audience: maintainers, contributors, reviewers, and AI coding agents.

- Status: Accepted
- Decision date: 2026-09-17
- Owners: repository maintainers

## Context

Progressive Time needs a stable web baseline before broader refactoring and a
future desktop edition. The team wants Bun experience without making Bun the
production JavaScript runtime before its compatibility is proven across the
current SvelteKit and Cloudflare build chain.

## Decision

- The application MUST use the Node version declared in `.node-version` as its
  JavaScript runtime.
- Bun 1.4.2 MUST be the package manager, and `bun.lock` MUST be the only package
  lockfile.
- The web application MUST use SvelteKit, Vite, the Cloudflare adapter, Workers,
  and KV.
- TypeScript strict mode, Biome, `svelte-check`, Vitest, CodeQL, and `bun audit`
  MUST remain quality and security gates.
- Valibot MUST validate data at trust boundaries.
- The web UI SHOULD use plain CSS while its styling needs remain small.
- A Tauri and SQLite desktop edition requires an approved specification and a
  separate ADR before implementation.

## Alternatives considered

- npm or pnpm: not selected because this repository is intentionally adopting
  Bun as its package manager.
- Bun as the build runtime: deferred because team experience is still forming
  and the Windows Cloudflare adapter path showed runtime incompatibility.
- Tailwind CSS: not selected because the current UI does not justify an added
  styling abstraction and dependency.

## Consequences

- CI MUST install Bun and Node, then use `bun ci` for frozen dependencies.
- Package scripts MAY invoke Node explicitly where tool compatibility requires
  it.
- Cloudflare dashboard build settings and repository configuration MUST remain
  synchronized with the pinned Bun version.
- The future desktop architecture will need explicit storage, synchronization,
  migration, and security decisions.

## Related specifications

- None.

## Supersession

- Supersedes: None.
- Superseded by: None.
