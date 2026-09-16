---
title: Repository Instructions
created: 2026-09-17T01:09:47+07:00
modified: 2026-09-17T01:49:36+07:00
---

# Repository Instructions

This file is the authoritative guide for humans and AI coding agents working in this repository.

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
2. Inspect existing code, tests, and canonical documentation before proposing a change.
3. For significant work, use `SPECIFY -> PLAN -> TASKS -> IMPLEMENT`, with human validation between planning phases.
4. Implement one reviewable concern at a time. Keep refactors separate from behavior changes.
5. Validate at system boundaries and add regression tests for behavior or security changes.
6. Review the final diff across correctness, readability, architecture, security, and performance.
7. Use small Conventional Commits. Do not push, merge, deploy, or publish without explicit authorization.

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
