---
title: How to Propose an Architecture Decision
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: contributors and AI coding agents who meet an ADR trigger
content_type: how-to
tags:
  - architecture
  - decisions
  - how-to
---

# How to propose an architecture decision

This guide takes a decision from "this needs an ADR" to a proposed record that a maintainer can decide.
Use it when your change meets a trigger in the [decision protocol](../../AGENTS.md#decision-protocol).

## Before you start

- You can state the decision as one question.
- You have read the [decision log](../ADR/README.md).

## Steps

1. Search for an existing record on the topic.

    ```bash
    grep -ril "<topic>" docs/ADR
    ```

    If an accepted ADR already answers the question, follow it and stop here.
    If you want to change an accepted ADR, continue, and plan to supersede it.

2. Copy the template with the next unused number and a verb-phrase slug.

    ```bash
    cp docs/ADR/ADR-000-template.md docs/ADR/ADR-005-choose-sync-strategy.md
    ```

3. Write **Context and problem statement** with evidence: file paths, test results, measurements, or links.
    End it with the question.

4. List the **Decision drivers** you will use to compare options.

5. List at least two **Considered options** that someone could reasonably choose, including the current state.

6. Write **Pros and cons** for every option, including costs for the option you prefer.

7. Write **Decision outcome** with your recommended option and the reason in terms of the drivers.
    Keep `status: proposed` and leave `decision-makers` empty.

8. Write **Consequences** and **Confirmation**, then write the **Summary** Y-statement last.

9. Check the record against [readiness to decide](../reference/decision-records.md#readiness-to-decide) and the [anti-patterns](../reference/decision-records.md#anti-patterns).

10. Add the record to both tables in [`docs/ADR/README.md`](../ADR/README.md).
    If it supersedes an ADR, fill in `supersedes`.

11. Commit the record on its own.

    ```bash
    git commit -m "docs(adr): propose ADR-005 choose sync strategy" -m "Refs: ADR-005"
    ```

12. Ask a maintainer for the decision using the [decision request format](../reference/decision-records.md#decision-requests), and pause work that depends on it.
