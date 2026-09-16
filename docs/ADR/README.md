---
title: Architecture Decision Records
created: 2026-09-17T02:00
modified: 2026-09-17T02:00
audience: maintainers, contributors, reviewers, and AI coding agents
content_type: reference
tags:
  - architecture
  - decisions
  - reference
---

# Architecture Decision Records

Audience: maintainers, contributors, reviewers, and AI coding agents.

This directory is the authoritative history of consequential architecture and
domain decisions. Before planning or changing the repository, contributors
MUST review this index and every ADR related to the affected area.

Create an ADR when a decision changes a domain model, business rule, public
contract, authentication boundary, persistence model, runtime, deployment,
dependency strategy, or another choice that is expensive to reverse.

## Lifecycle

1. Copy [`ADR-000-template.md`](ADR-000-template.md).
2. Assign the next sequential number and a concise kebab-case title.
3. Use one of: `Proposed`, `Accepted`, `Deprecated`, or `Superseded`.
4. Link related specifications and ADRs.
5. After acceptance, do not rewrite history. Create a new ADR and mark the old
   record as superseded when the decision changes.

## Index

- [ADR-001: Web runtime and toolchain](ADR-001-web-runtime-and-toolchain.md) — Accepted
