---
title: Product and Engineering Specifications
created: 2026-09-17T02:00
modified: 2026-09-17T02:00
audience: product owners, maintainers, contributors, reviewers, and AI coding agents
content_type: reference
tags:
  - specification
  - product
  - engineering
---

# Product and Engineering Specifications

Audience: product owners, maintainers, contributors, reviewers, and AI coding
agents.

Specifications define intended behavior before implementation. Significant
changes to behavior, contracts, data, user journeys, acceptance criteria, or
security boundaries MUST have an approved specification in this directory.

Use `SPECIFY -> PLAN -> TASKS -> IMPLEMENT`, with human validation between the
planning phases. An ADR records why an architectural decision was made; a SPEC
defines what must be delivered and how it will be accepted. Link both when a
change needs them.

## Workflow

1. Copy [`SPEC-000-template.md`](SPEC-000-template.md).
2. Define the primary persona and problem before proposing implementation.
3. Record scope, requirements, business rules, risks, and acceptance criteria.
4. Link applicable ADRs and update them when architecture decisions change.
5. Obtain human approval before implementation begins.
6. Keep implementation tasks traceable to acceptance criteria.
