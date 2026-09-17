---
title: Specifications
created: 2026-09-17T02:00:00+07:00
modified: 2026-09-17T02:47:31+07:00
audience: product owners, maintainers, reviewers, and AI coding agents
content_type: reference
tags:
  - specification
  - product
  - engineering
---

# Specifications

A specification (SPEC) defines what must be delivered and how acceptance is verified, before implementation starts.

An ADR explains why an architectural choice was made; a SPEC links the ADRs it depends on.

- When a SPEC is required: [`AGENTS.md`](../../AGENTS.md#working-method).
- Format, statuses, requirement identifiers, and acceptance criteria: [Decision records](../reference/decision-records.md#specifications).
- How acceptance criteria map to tests: [Testing conventions](../reference/testing-conventions.md#given-when-then).
- Starting point for a new SPEC: [`SPEC-000-template.md`](SPEC-000-template.md).

## Workflow

Significant work moves through `SPECIFY -> PLAN -> TASKS -> IMPLEMENT`.

A human approves the SPEC before planning, and the plan before implementation.

## Index

| SPEC | Capability | Status | ADRs |
| --- | --- | --- | --- |
| [SPEC-001](SPEC-001-event-persistence-integrity.md) | Event persistence integrity | approved | ADR-003 |
