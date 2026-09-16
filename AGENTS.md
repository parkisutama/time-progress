---
title: Repository Instructions
created: 2026-09-17T01:09:47+07:00
modified: 2026-09-17T01:49:36+07:00
audience: maintainers, contributors, and AI coding agents
content_type: reference
tags:
  - engineering
  - ai-assisted
  - governance
---

# Repository Instructions

This file is the authoritative guide for humans and AI coding agents working in this repository.

## Normative Language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** in this repository are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14), [RFC 2119](https://www.rfc-editor.org/info/rfc2119), and [RFC 8174](https://www.rfc-editor.org/info/rfc8174) when, and only when, they appear in all capitals.

## Product and Architecture

- Progressive Time is a SvelteKit application deployed to Cloudflare Workers.
- Runtime data is stored per authenticated email in the `EVENTS` KV binding.
- Cloudflare Access supplies the authenticated user identity.
- `src/routes/events/+server.ts` is the server boundary for event CRUD.
- `src/lib/event-schema.ts` owns the shared Valibot contracts.
- A future Tauri/SQLite application is planned, but it is not part of the current web runtime.

## Toolchain

- Node: the exact version in `.node-version`.
- Package manager: the exact Bun version in `package.json`; `bun.lock` is authoritative.
- Formatting and linting: Biome.
- Type and Svelte diagnostics: `svelte-check` with TypeScript strict mode.
- Unit tests: Vitest.
- Deployment: SvelteKit Cloudflare adapter and Wrangler.

Do not add another lockfile or replace Bun without an explicit repository decision.

## Working Method

1. Start from a clean, current `main` and create a short-lived branch.
2. Before planning or editing, MUST read `docs/ADR/README.md` and every ADR relevant to the affected domain, business rule, data contract, architecture, dependency, or platform.
3. Inspect existing code, tests, specifications, and canonical documentation before proposing a change.
4. Significant work MUST use `SPECIFY -> PLAN -> TASKS -> IMPLEMENT`, with human validation between planning phases. Specifications MUST live under `docs/SPEC/`.
5. Implement one reviewable concern at a time. Refactors MUST remain separate from behavior changes.
6. Validate at system boundaries and add regression tests for behavior or security changes.
7. Review the final diff across correctness, readability, architecture, security, and performance.
8. Commits MUST be atomic and follow [Conventional Commits 1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/).
9. Do not push, merge, deploy, release, or publish without explicit authorization.

## Skill Routing

- Engineering tasks MUST use the relevant Addy Osmani engineering skill when it is available. Examples include security hardening, test-driven development, code review, debugging, migrations, performance, CI/CD, and architecture.
- Product discovery and product-management tasks MUST use the relevant Dean Peters product-management skill when it is available. Examples include problem framing, PRDs, user stories, prioritization, roadmaps, and stakeholder communication.
- Every Markdown creation, edit, or review MUST use the `markdown-writing-portability` skill and remain portable across CommonMark and GFM renderers.
- Skills guide execution but MUST NOT override repository ADRs, approved specifications, security boundaries, or explicit human decisions.

## Documentation System

- Documentation MUST follow [Diátaxis](https://diataxis.fr/) and be organized by user need and content type, not by implementation folder structure.
- Every document MUST identify its primary persona or audience before writing begins.
- Tutorials MUST support a learning journey; how-to guides MUST solve a concrete task; reference MUST describe facts and contracts; explanation MUST build understanding and rationale.
- A single document SHOULD NOT mix content types. Link to another document when the reader's need changes.
- Portable Markdown MUST follow [`docs/reference/engineering-governance.md`](docs/reference/engineering-governance.md).
- Architecture and domain decisions MUST be recorded in `docs/ADR/`. ADRs MUST cover consequential domain models, business rules, public contracts, authentication, persistence, dependencies, runtime, deployment, and decisions expensive to reverse.
- Accepted ADRs MUST NOT be rewritten to hide history. A changed decision MUST be recorded in a new ADR that supersedes the earlier ADR.
- Specifications MUST be written in `docs/SPEC/` before implementation when behavior, contracts, data, user journeys, or acceptance criteria change.
- Notable user-facing, operational, security, deprecation, and breaking changes MUST update `CHANGELOG.md` in the same change.

## Required Verification

Run `bun run verify` before requesting merge. It covers:

- `bun run lint`
- `bun run check`
- `bun run test`
- `bun run build`
- `bun run security:audit`

Also run `git diff --check` and inspect the staged diff before every commit. Automated checks do not replace browser, Cloudflare, desktop, or human acceptance where those are relevant.

## Security Boundaries

- Treat request bodies, KV contents, headers, local storage, remote responses, and AI-generated content as untrusted.
- Validate external input with strict Valibot schemas before using or storing it.
- Every `/events` endpoint must require an authenticated user and scope storage to that identity.
- `DEV_BYPASS_EMAIL` is local-only and belongs in an ignored `.dev.vars` file. Never configure it in deployed Worker variables.
- Never commit tokens, credentials, private keys, `.env` files, or production personal data.
- Never pass untrusted values to HTML injection, `eval`, shell commands, file paths, or dynamically constructed queries.
- Treat dependency changes as code changes: review the manifest and lockfile, use frozen installs in CI, and run `bun audit`.
- Destructive operations, authentication changes, new external integrations, permission expansion, and secret handling require explicit human approval.

## Scope Discipline

- Preserve unrelated user changes and generated files.
- Do not introduce dependencies when the platform or existing stack already solves the problem.
- Do not silently weaken tests, security headers, validation, or quality gates to make a check pass.
- Record meaningful deferred risks in documentation instead of hiding them behind fallbacks.

## Versioning and Releases

- Releases MUST follow [Semantic Versioning 2.0.0](https://semver.org/).
- Before `1.0.0`, PATCH is for backward-compatible fixes and MINOR is for new capability or any breaking contract change. Breaking changes MUST still be declared explicitly.
- From `1.0.0`, PATCH is for backward-compatible fixes, MINOR for backward-compatible functionality, and MAJOR for incompatible public contract changes.
- Security fixes use PATCH unless they require an incompatible contract change.
- A release MUST update `CHANGELOG.md`, set the version consistently, pass `bun run verify`, and use an annotated `vMAJOR.MINOR.PATCH` tag.
- Changelog entries MUST follow [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) with an `Unreleased` section and the applicable `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security` groups.
