---
title: "SPEC-NNN: Capability name"
created: YYYY-MM-DDTHH:mm
modified: YYYY-MM-DDTHH:mm
audience: primary user persona and implementation reviewers
content_type: reference
status: draft
owner: repository maintainers
approvers: []
target-release: unscheduled
tags:
  - specification
  - product
---

# SPEC-NNN: Capability name

<!--
Copy to docs/SPEC/SPEC-NNN-<capability>.md.
Format reference: docs/reference/decision-records.md#specifications.
Keep status "draft" until a human approver sets "approved".
-->

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

## Summary

<!-- One paragraph: who gets what outcome, and why now. -->

## Problem

<!-- The user problem, the evidence for it, and what happens if nothing changes. -->

## Personas

- <persona>: <goal and context>

## Goals

- <measurable outcome>

## Non-goals

- <deliberately excluded outcome>

## User journeys

<!-- Trigger, steps, and result for each persona. -->

## Requirements

| ID | Requirement |
| --- | --- |
| REQ-1 | The system MUST <observable behavior>. |

## Domain and business rules

<!-- Terminology, invariants, validation, authorization, and data ownership. -->

## Security and privacy

<!-- Trust boundaries, sensitive data, threats, and required controls. Update the threat model if they change. -->

## Acceptance criteria

<!-- One Given-When-Then per criterion. Each criterion is verified by a test whose name contains its ID, or by a recorded manual acceptance. -->

```text
AC-1
Given <starting state>
When <single action>
Then <observable outcome>
```

| Criterion | Requirements | Verification |
| --- | --- | --- |
| AC-1 | REQ-1 | Integration test / E2E test / manual acceptance |

## Delivery plan

<!-- Reviewable tasks, written after this specification is approved. Each task names the acceptance criteria it satisfies. -->

## Open questions

<!-- Questions that block approval. Questions that meet an ADR trigger become proposed ADRs. -->

## Related records

- ADRs: none.
- Superseded specifications: none.
