---
title: Claude Instructions
created: 2026-09-17T01:50
modified: 2026-09-17T02:45
audience: Claude Code and other Claude-based coding agents
content_type: reference
tags:
  - ai-assisted
  - governance
---

# Claude instructions

@AGENTS.md

The line above imports [`AGENTS.md`](AGENTS.md) into Claude Code's context.
`AGENTS.md` is the authoritative repository contract.
This file adds only Claude-specific practice and never restates or relaxes it.

## Claude-specific practice

- Treat the `SPECIFY` and `PLAN` phases as plan-only work: present the plan and wait for approval before editing files.
- Load the matching skill before the work starts and name it in your first update:
    - ADRs, specifications, and documentation: `documentation-and-adrs`.
    - Any Markdown file: `markdown-writing-portability`.
    - Commits, branches, changelog, and releases: `git-workflow-and-versioning`.
    - Tests and bug fixes: `test-driven-development`.
    - Reviews: `code-review-and-quality`, writing findings as Conventional Comments.
    - Authentication, validation, and secrets: `security-and-hardening`.
- Ask for decisions with the structured question tool when it is available, using the decision request format from the [decision records reference](docs/reference/decision-records.md#decision-requests).
- Keep tool-added trailers such as `Co-Authored-By:` after the repository's `Refs:` footer.
- Do not save repository rules or decisions to personal memory as a substitute for recording them in the repository.
  If something is worth remembering across sessions, propose a change to `AGENTS.md`, an ADR, or a reference document.
