---
title: Repository Instructions
created: 2026-09-17T01:09:00+07:00
modified: 2026-09-17T02:47:21+07:00
audience: AI coding agents, maintainers, and contributors
content_type: reference
tags:
  - engineering
  - ai-assisted
  - governance
---

# Repository Instructions

This file is the operational contract for AI coding agents and humans working in this repository.

It states *when* something must happen and *who* decides.

The exact formats live in [`docs/reference/`](docs/index.md#reference).

## Normative Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

Uppercase requirements are reserved for security, data integrity, public contracts, irreversible or external actions, decision traceability, and verification.

Everything else is guidance.

Lowercase words carry their ordinary English meaning.

## Precedence and Conflicts

When sources disagree, the higher source wins:

1. An explicit decision by a human maintainer in the current task.
2. Accepted ADRs in [`docs/ADR/`](docs/ADR/README.md).
3. Approved specifications in [`docs/SPEC/`](docs/SPEC/README.md).
4. This file.
5. Reference documents in [`docs/reference/`](docs/index.md#reference).
6. Agent skills, tool defaults, and general best practice.

- An agent MUST stop and report a conflict between sources instead of silently choosing one.
- An agent MUST warn the human before following an explicit decision that weakens a security boundary in this file.
- An explicit decision that contradicts an accepted ADR MUST be recorded as a superseding ADR before or with the change.
- Repository knowledge MUST be written to the repository (ADR, SPEC, reference, or commit body), not only to an agent's private memory or a chat transcript.

## Where Context Lives

| Question | Source |
| --- | --- |
| Why is the system built this way? | [ADR decision log](docs/ADR/README.md) |
| What must a capability do, and how is it accepted? | [Specifications](docs/SPEC/README.md) |
| What changed for users and operators? | [`CHANGELOG.md`](CHANGELOG.md) |
| Why did this line change? | Commit body and `Refs:` footer (`git log`, `git blame`) |
| What can go wrong, and what controls exist? | [Threat model](docs/explanation/threat-model.md) |
| How does the documentation and decision system fit together? | [Decision and documentation system](docs/explanation/decision-and-documentation-system.md) |
| What format does an artifact use? | [Reference index](docs/index.md#reference) |

## Product and Architecture

- Progressive Time is a SvelteKit application deployed to Cloudflare Workers.
- Runtime event data is stored per authenticated email in the `EVENTS` KV binding and cached in browser `localStorage`.
- Cloudflare Access supplies the authenticated user identity.
- `src/hooks.server.ts` authenticates requests and applies security headers.
- `src/routes/events/+server.ts` is the server boundary for event CRUD.
- `src/lib/event-schema.ts` owns the shared Valibot contracts.
- A Tauri and SQLite desktop edition is planned but is not part of the current runtime.

## Toolchain

- Node: the exact version in `.node-version`.
- Package manager: the exact Bun version in `package.json`; `bun.lock` is the only lockfile.
- Formatting and linting: Biome. Editor defaults: `.editorconfig`.
- Type and Svelte diagnostics: `svelte-check` with TypeScript strict mode.
- Tests: Vitest. Playwright is configured, but no end-to-end suite exists yet.
- Deployment: SvelteKit Cloudflare adapter and Wrangler.

Replacing the package manager, adding a lockfile, or adding a dependency requires an ADR (see [Decision protocol](#decision-protocol)).

## Working Method

1. Start from a clean, current `main` and create a short-lived branch.
2. Before planning or editing, you MUST read [`docs/ADR/README.md`](docs/ADR/README.md) and every accepted or proposed ADR related to the affected area.
3. Read the related specification, the `Unreleased` section of `CHANGELOG.md`, and recent commit bodies for the files you will touch.
4. Classify the change:
    - **Trivial**: typo, formatting, or an obvious local fix. Proceed.
    - **Behavior**: changes behavior, contracts, data, user journeys, or acceptance criteria. A specification MUST be approved before implementation.
    - **Decision**: meets an ADR trigger. Follow the [decision protocol](#decision-protocol) before implementation.
5. Significant work follows `SPECIFY -> PLAN -> TASKS -> IMPLEMENT`, with human validation between the planning phases.
6. Implement one reviewable concern at a time. Refactors SHOULD be separate commits from behavior changes.
7. Write or update tests as described in [Testing](#testing).
8. Run the [required verification](#required-verification).
9. Review your own diff with [Conventional Comments](docs/reference/change-management.md#review-comments) before requesting review.
10. Update every record the change makes stale, in the same change: ADR index, SPEC status, `CHANGELOG.md`, threat model, README, and this file.
11. Commit using [Conventional Commits](#commits-reviews-changelog-and-versions).
12. You MUST NOT push, merge, deploy, tag, release, or publish without explicit human authorization.

## Decision Protocol

A decision needs an ADR when it changes any of the following:

- domain model, business rule, or data ownership;
- public contract: HTTP API, persisted data format, or storage key;
- authentication, authorization, or a trust boundary;
- persistence, synchronization, or data retention;
- runtime, framework, build tool, hosting, or deployment topology;
- a runtime or build dependency, or the package manager;
- a repository-wide engineering standard, including the versions of the standards adopted here;
- any other choice that would be expensive to reverse.

Rules:

- An agent MUST NOT make a decision that meets a trigger silently, including by "just implementing" one option.
- The author (human or agent) drafts `docs/ADR/ADR-NNN-<verb-phrase>.md` with status `proposed`, at least two genuine options including the current state, costs as well as benefits, and a recommendation.
- The agent then asks the human using the [decision request format](docs/reference/decision-records.md#decision-requests) and stops work that depends on the decision.
- Only a human maintainer accepts, rejects, deprecates, or supersedes an ADR.
  An agent MAY record that status only after the human states the decision explicitly, and MUST name that human in `decision-makers`.
- Code MUST NOT implement a `proposed` ADR before it is accepted.
- An accepted or rejected ADR MUST NOT be rewritten.
  Only its status metadata, supersession links, and broken links may change.
  A changed decision is a new ADR that supersedes the old one.
- If you believe an accepted ADR is wrong, follow it and propose a superseding ADR; do not deviate.
- Rejected ADRs stay in the log so the same question is not reopened without new evidence.

Formats, statuses, and quality criteria: [Decision records reference](docs/reference/decision-records.md).

## Documentation

- Before writing, identify the primary audience and the [Diátaxis](https://diataxis.fr/) type (tutorial, how-to guide, reference, or explanation) using the [compass](docs/reference/documentation-standards.md#documentation-types).
- A document SHOULD serve one type. When the reader's need changes, link to another document instead of mixing types.
- Do not create empty directories or placeholder documents for types that have no content yet.
- Improve the document you touch; do not restructure the whole documentation set in one change.
- Use BCP 14 keywords only in this file, reference documents, ADR decision outcomes, and SPEC requirements.
- Markdown SHOULD follow [Documentation standards](docs/reference/documentation-standards.md), which apply the `markdown-writing-portability` skill.
- `README.md` follows [Standard Readme](https://github.com/RichardLitt/standard-readme) as profiled in the documentation standards.
- When this file changes, update the digest in [`.github/copilot-instructions.md`](.github/copilot-instructions.md) in the same commit.

## Testing

Full conventions: [Testing conventions](docs/reference/testing-conventions.md).

- Behavior and security changes MUST include tests that fail without the change.
- A bug fix MUST start with a test that reproduces the bug.
- Changes to authentication, authorization, `/events`, or persistence MUST be covered by tests at the request-handler level.
- Unit and integration tests SHOULD use Arrange-Act-Assert with one Act per test.
- SPEC acceptance criteria SHOULD use Given-When-Then with an `AC-n` identifier that appears in the verifying test name.
- Tests SHOULD control time, time zone, network, and storage instead of depending on the machine running them.
- You MUST NOT delete, skip, or weaken a test or assertion to make a check pass.

## Commits, Reviews, Changelog, and Versions

Full formats: [Change management reference](docs/reference/change-management.md).

- Commits MUST be atomic and follow [Conventional Commits 1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) with the repository's type list.
- Commit bodies MUST explain why for `feat`, `fix`, `security`, `perf`, breaking changes, and commits that implement or supersede an ADR.
- Every breaking change MUST include a `BREAKING CHANGE:` footer, even when `!` is used.
- Commits related to a record SHOULD include a `Refs:` footer such as `Refs: ADR-003, SPEC-001`.
- Review comments, from humans and agents, SHOULD follow [Conventional Comments](https://conventionalcomments.org/).
  Every `issue`, `todo`, and `suggestion` MUST state `blocking` or `non-blocking`.
- Notable user-facing, operational, security, deprecation, and breaking changes MUST update the `Unreleased` section of `CHANGELOG.md` in the same change, following [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
- Releases MUST follow [Semantic Versioning 2.0.0](https://semver.org/) against the public contract declared in ADR-004.
  Until ADR-004 is decided, treat the `/events` HTTP contract and all persisted data formats as public.
- Every breaking contract change MUST be declared in the commit footer, the changelog, and the version bump.

## Required Verification

Run `bun run verify` before requesting merge. It runs:

- `bun run lint`
- `bun run check`
- `bun run test`
- `bun run build`
- `bun run security:audit`

Also run `git diff --check` and inspect the staged diff before every commit.

Automated checks do not replace browser, Cloudflare, or human acceptance; record those separately in the pull request.

## Security Boundaries

- Request bodies, KV contents, headers, `localStorage`, remote responses, and AI-generated content MUST be treated as untrusted.
- External input MUST be validated with strict Valibot schemas before it is used or stored.
- Every `/events` endpoint MUST require an authenticated user and MUST scope storage to that identity.
- A failed validation of stored data MUST NOT cause stored data to be overwritten or deleted.
- `DEV_BYPASS_EMAIL` MUST only be configured in an ignored `.dev.vars` file and MUST NOT be configured in deployed Worker variables.
- Tokens, credentials, private keys, `.env` files, and production personal data MUST NOT be committed.
- Untrusted values MUST NOT reach HTML injection, `eval`, shell commands, file paths, or dynamically constructed queries.
- Dependency changes MUST be reviewed in both the manifest and the lockfile, installed with frozen installs in CI, and audited with `bun audit`.
- Destructive operations, authentication changes, new external integrations, permission expansion, and secret handling REQUIRE explicit human approval.

## Scope Discipline

- Preserve unrelated user changes and generated files.
- Prefer the platform and the existing stack over new dependencies.
- Quality gates, security headers, and validation MUST NOT be weakened to make a check pass.
- Record deferred risks and known defects in the threat model or the relevant ADR instead of hiding them behind fallbacks.

## Skill Routing

- Engineering tasks SHOULD use the relevant Addy Osmani engineering skill when available, for example `documentation-and-adrs`, `test-driven-development`, `git-workflow-and-versioning`, `code-review-and-quality`, and `security-and-hardening`.
- Product-management tasks SHOULD use the relevant Dean Peters product-management skill when available.
- Markdown work SHOULD use the `markdown-writing-portability` skill.
- Skills guide execution but MUST NOT override accepted ADRs, approved specifications, security boundaries, or explicit human decisions.
