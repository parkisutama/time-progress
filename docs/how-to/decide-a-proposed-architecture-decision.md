---
title: How to Decide a Proposed Architecture Decision
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers who accept or reject architecture decisions
content_type: how-to
tags:
  - architecture
  - decisions
  - how-to
---

# How to decide a proposed architecture decision

This guide takes a `proposed` ADR to `accepted` or `rejected`.

## Before you start

- You are a maintainer with authority over the affected area.
- The ADR is listed under **Awaiting decision** in the [decision log](../ADR/README.md).

## Steps

1. Read the **Summary** and **Decision outcome** of the ADR.

2. Check that the record is ready to decide:
    - evidence supports the recommended option;
    - decision drivers and at least two genuine options are compared;
    - the people who implement or operate the result agree, or their disagreement is recorded;
    - the record is understandable without the conversation that produced it;
    - follow-up work and the confirmation method are named.

    If an item is missing, request changes with a review comment such as `todo (blocking): add evidence for option 2`, and stop here.

3. Choose one outcome:
    - **Accept** the recommended option.
    - **Accept a different option**: ask the author to rewrite **Decision outcome** and **Consequences** for that option first, while the status is still `proposed`.
    - **Reject** every option: the record stays in the log with the reason, so the question is not reopened without new evidence.
    - **Defer**: leave it `proposed` and add the missing information or the date to revisit under **More information**.

4. Record the outcome in the frontmatter.

    ```yaml
    status: accepted
    date: 2026-09-18
    decision-makers:
      - Parkis Utama
    ```

    If you work with an AI agent, telling it "accept ADR-002" is enough; the agent records these fields and names you.

5. In the summary sentence, change "we propose" to "we decided for" and "neglect" to "neglected".

6. If the ADR supersedes another ADR, set `status: superseded` and `superseded-by` on the older record.

7. In [`docs/ADR/README.md`](../ADR/README.md), remove the row from **Awaiting decision** and update the status and date in **Decision log**.

8. Commit the decision on its own.

    ```bash
    git commit -m "docs(adr): accept ADR-002 verify Cloudflare Access identity" -m "Refs: ADR-002"
    ```

9. Create the SPEC or implementation task named in **Confirmation** and **Consequences**.
    The changelog is updated when the decision is implemented, not when it is accepted.
