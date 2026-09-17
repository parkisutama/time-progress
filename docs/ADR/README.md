---
title: Architecture Decision Records
created: 2026-09-17T02:00
modified: 2026-09-17T02:45
audience: maintainers, contributors, reviewers, and AI coding agents
content_type: reference
tags:
  - architecture
  - decisions
  - reference
---

# Architecture decision records

This directory is the decision log for Progressive Time.
Each record captures one architectural decision, the options that were considered, and the consequences that were accepted.

- When an ADR is required and who decides: [`AGENTS.md`](../../AGENTS.md#decision-protocol).
- Format, statuses, and quality criteria: [Decision records](../reference/decision-records.md).
- Writing a record: [How to propose an architecture decision](../how-to/propose-an-architecture-decision.md).
- Deciding a record: [How to decide a proposed architecture decision](../how-to/decide-a-proposed-architecture-decision.md).
- Starting point for a new record: [`ADR-000-template.md`](ADR-000-template.md).

## Awaiting decision

| ADR | Question | Recommendation |
| --- | --- | --- |
| [ADR-002](ADR-002-verify-cloudflare-access-identity.md) | Should the Worker trust the Access email header, or verify the Access token? | Verify the Access token in the Worker |

## Decision log

| ADR | Decision | Status | Date |
| --- | --- | --- | --- |
| [ADR-001](ADR-001-web-runtime-and-toolchain.md) | Web runtime and toolchain | accepted | 2026-09-17 |
| [ADR-002](ADR-002-verify-cloudflare-access-identity.md) | Verify Cloudflare Access identity | proposed | 2026-09-17 |
