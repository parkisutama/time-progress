---
title: Decision Records
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers, contributors, reviewers, and AI coding agents
content_type: reference
tags:
  - architecture
  - decisions
  - specification
  - reference
---

# Decision records

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

This reference defines the format of architecture decision records (ADRs), specifications (SPECs), and decision requests.
When a record is required and who decides are defined in [`AGENTS.md`](../../AGENTS.md#decision-protocol).

## Record map

| Record | Answers | Written | After approval |
| --- | --- | --- | --- |
| ADR | Why the system is built this way, and what was rejected | Before implementing a consequential decision | Immutable; replaced by a superseding ADR |
| SPEC | What must be delivered and how acceptance is checked | Before a significant behavior change | Only status changes; replaced by a superseding SPEC |
| `CHANGELOG.md` entry | What changed for users and operators | In the same change | Editable only while under `Unreleased` |
| Commit body | Why this specific diff exists | With every non-trivial commit | Never rewritten after push |
| Pull request description | Review context and verification evidence | With each pull request | — |
| Code comment | A non-obvious local reason or gotcha | With the code | Changes with the code |

Records link to each other so that a reader can move from any one of them to the others: a SPEC links its ADRs, commits carry `Refs:` footers, and changelog entries describe the resulting impact.

## Architecture decision records

An ADR captures one architectural decision (AD): a justified design choice that addresses an architecturally significant requirement, with its trade-offs and consequences.
The collection of ADRs in [`docs/ADR/`](../ADR/README.md) is the decision log.
The format adapts [MADR](https://adr.github.io/madr/) and the practices collected at [adr.github.io](https://adr.github.io/).

### File name

- Pattern: `docs/ADR/ADR-NNN-<verb-phrase>.md`.
- `NNN` is the next unused three-digit number. Numbers are never reused, including for rejected ADRs.
- The slug is a lowercase, present-tense imperative verb phrase naming the decision, such as `ADR-002-verify-cloudflare-access-identity.md`.
- ADR-001 predates this pattern and keeps its name.

### Frontmatter

ADRs use the [standard frontmatter](documentation-standards.md#frontmatter) with `content_type: explanation`, plus:

| Field | Value |
| --- | --- |
| `status` | `proposed`, `accepted`, `rejected`, `deprecated`, or `superseded` |
| `date` | `YYYY-MM-DD` of the last status change |
| `decision-makers` | Humans who made the decision; empty while `proposed` |
| `consulted` | People or agents whose input was sought |
| `informed` | People who are told the outcome |
| `supersedes` | ADR identifiers this record replaces, or empty |
| `superseded-by` | ADR identifier that replaces this record, or empty |

ADR-001 predates these fields and records its status in the body.

### ADR status

| Status | Meaning | Set by | Implementation |
| --- | --- | --- | --- |
| `proposed` | Awaiting a human decision | Author (human or agent) | MUST NOT start |
| `accepted` | In force | Human decision-maker | Follows the ADR |
| `rejected` | Considered and declined; kept to prevent re-litigation | Human decision-maker | MUST NOT follow the rejected option |
| `deprecated` | No longer applies and has no replacement | Human decision-maker | Removed or ignored |
| `superseded` | Replaced by the ADR in `superseded-by` | Human decision-maker | Follows the superseding ADR |

```text
proposed ──> accepted ──> deprecated
   │             └──────> superseded
   └───────> rejected
```

### Sections

| Section | Required | Content |
| --- | --- | --- |
| Summary | Yes | One Y-statement |
| Context and problem statement | Yes | The situation, evidence with file paths or links, and the question to decide |
| Decision drivers | Yes | Forces and quality attributes used to compare options |
| Considered options | Yes | At least two genuine options, including the current state when one exists |
| Decision outcome | Yes | The chosen or recommended option and the reason, in terms of the drivers |
| Consequences | Yes | Good, bad, and neutral effects, including costs and follow-up work |
| Confirmation | Yes | How compliance is verified: tests, CI checks, review items, or measurements |
| Pros and cons of the options | When options are non-trivial | Arguments for and against each option |
| More information | Optional | Related ADRs, SPECs, links, and conditions that would reopen the decision |

### Y-statement

The summary is one sentence in this form:

```text
In the context of <use case or component>,
facing <concern or requirement>,
we decided for <chosen option>
and neglected <other options>,
to achieve <benefits or quality attributes>,
accepting <drawbacks>.
```

A `proposed` ADR uses "we propose" instead of "we decided for".

### Readiness to decide

A proposed ADR is ready for a decision when it provides:

- **Evidence** that the chosen option will work, such as a test, prototype, or reference.
- **Criteria and alternatives**: decision drivers and at least two options compared against them.
- **Agreement** from the people who must implement or operate the result, or a record of disagreement.
- **Documentation**: this record, complete enough for a reader without the original conversation.
- **Realization and review plan**: the follow-up tasks and the confirmation method.

### Anti-patterns

| Anti-pattern | Symptom | Correction |
| --- | --- | --- |
| Mega-ADR | Several independent decisions or a full design in one record | One decision per ADR; link related ADRs |
| Blueprint in disguise | Reads as an implementation plan rather than a choice | Move the plan to a SPEC; keep the choice |
| Sales pitch | Marketing adjectives; no measurable drivers | State drivers and evidence neutrally |
| Dummy alternative | Options that were never viable, or circular rejections | Compare only options someone could reasonably choose |
| Free lunch | Consequences list only benefits | Name the costs, risks, and follow-up work |
| Pinned detail | Version numbers or other fast-changing values in the decision | Reference the file that holds the value |

### Immutability

After an ADR is `accepted` or `rejected`, only these edits are allowed:

- `status`, `date`, `decision-makers`, and `superseded-by`;
- repairs of broken links;
- typo fixes that do not change meaning.

Any other change MUST be a new ADR that supersedes the old one.
Template changes are not applied retroactively; older ADRs keep the format they were written in.

## Specifications

A SPEC defines what must be delivered and how it will be accepted.
It does not justify architectural choices; it links the ADRs that do.

### File name and frontmatter

- Pattern: `docs/SPEC/SPEC-NNN-<capability>.md`, with the next unused three-digit number.
- Standard frontmatter with `content_type: reference`, plus `status`, `owner`, `approvers`, and `target-release`.

### SPEC status

| Status | Meaning | Set by |
| --- | --- | --- |
| `draft` | Being written | Author |
| `approved` | Ready to implement | Human approver |
| `implemented` | All acceptance criteria are verified | Maintainer |
| `withdrawn` | Abandoned before implementation | Human approver |
| `superseded` | Replaced by another SPEC | Human approver |

### Requirements and acceptance criteria

- Each requirement has an identifier `REQ-n` and uses BCP 14 keywords.
- Each acceptance criterion has an identifier `AC-n` and uses Given-When-Then.
- Every acceptance criterion MUST map to at least one automated test or a recorded manual acceptance.
- The verifying test name contains the `AC-n` identifier; see [Testing conventions](testing-conventions.md#given-when-then).

```text
AC-1
Given a signed-in user with three stored events
When the user creates a fourth event
Then all four events are stored for that user
```

## Decision requests

When a decision is needed, an agent asks the human in this format and links the proposed ADR:

```text
Decision needed: <one question>
Why now: <what is blocked or which trigger applies>
Options:
  A. <option>: <main benefit>; <main cost>; reversible: <easily|costly>
  B. <option>: <main benefit>; <main cost>; reversible: <easily|costly>
Recommendation: <option>, because <decision driver>
If undecided: <work that stops, or the safe default that continues>
Record: docs/ADR/ADR-NNN-<verb-phrase>.md (proposed)
```

The human may answer with only the chosen option.
The agent then records the outcome as defined in [`AGENTS.md`](../../AGENTS.md#decision-protocol).
