---
title: Engineering Governance Reference
created: 2026-09-17T01:50
modified: 2026-09-17T01:50
audience: maintainers, contributors, release managers, and AI coding agents
content_type: reference
tags:
  - reference
  - engineering
  - governance
---

# Engineering governance reference

## Audience

This reference serves maintainers, contributors, release managers, and AI coding agents applying repository standards.

## Normative terms

Uppercase requirement terms are interpreted according to [BCP 14](https://www.rfc-editor.org/info/bcp14), [RFC 2119](https://www.rfc-editor.org/info/rfc2119), and [RFC 8174](https://www.rfc-editor.org/info/rfc8174).

Lowercase words such as "should" are descriptive and do not carry BCP 14 force.

## Documentation classification

Every document MUST declare one primary persona and one primary [Diátaxis](https://diataxis.fr/) content type before drafting begins.

| Type | Reader state | Authoring rule |
| --- | --- | --- |
| Tutorial | Learning with guidance | Lead the reader through a reliable end-to-end experience |
| How-to guide | Acting toward a known goal | Provide goal-oriented steps and prerequisites |
| Reference | Looking up facts | Be complete, precise, neutral, and structured around the subject |
| Explanation | Building understanding | Discuss context, alternatives, relationships, and rationale |

Documents MUST be organized by these user needs rather than by source-code module names. Mixed-purpose documents SHOULD be split and cross-linked.

## Portable Markdown

Markdown MUST remain portable across CommonMark, GFM, GitHub Pages, MkDocs, Pandoc, Typora, and Obsidian.

- Every Markdown file MUST include `title`, `created`, `modified`, and multiline `tags` YAML frontmatter.
- Headings MUST use ATX syntax and MUST NOT skip levels.
- Internal links MUST use standard Markdown links, never wikilinks.
- Code blocks MUST be fenced and include a language identifier.
- Tables MUST use compact GFM pipe syntax.
- Prose MUST use semantic line breaks rather than arbitrary hard wrapping.
- Bare URLs, tabs, trailing spaces, duplicate headings, and multiple consecutive blank lines MUST NOT be introduced.

## ADR workflow

Before any development task, contributors MUST read `docs/ADR/README.md` and all ADRs relevant to the affected domain or system boundary.

An ADR is REQUIRED for decisions that change domain models, business rules, authentication, authorization, persistence, public contracts, runtime, framework, major dependency, infrastructure, deployment, or another choice expensive to reverse.

ADRs use the lifecycle `Proposed -> Accepted -> Superseded` or `Deprecated`. Accepted records MUST remain immutable except for status and supersession links.

## Specification workflow

A SPEC is REQUIRED before significant implementation that changes user behavior, business rules, data contracts, APIs, security boundaries, or acceptance criteria.

Each SPEC MUST define the problem, personas, scope, requirements, non-goals, acceptance criteria, security considerations, and links to relevant ADRs.

## Atomic commits and Conventional Commits

Every commit MUST represent one complete, independently understandable concern and MUST leave the branch in a verifiable state.

Messages MUST follow [Conventional Commits 1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) using:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Use `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, or `revert` as appropriate. Breaking changes MUST use a `BREAKING CHANGE:` footer and MUST be reflected in the changelog and SemVer decision.

## Changelog

`CHANGELOG.md` MUST follow [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

- Human-impacting entries MUST be added under `Unreleased` in the same change.
- Entries MUST be curated for humans, not generated as a raw commit log.
- Releases MUST use ISO `YYYY-MM-DD` dates and reverse chronological order.
- Use only applicable `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security` headings.
- Every release and yanked release MUST remain discoverable.

## Semantic Versioning

Releases MUST follow [Semantic Versioning 2.0.0](https://semver.org/).

| Project stage | Change | Version increment |
| --- | --- | --- |
| Before `1.0.0` | Backward-compatible fix | PATCH |
| Before `1.0.0` | New capability or incompatible contract | MINOR |
| From `1.0.0` | Backward-compatible fix | PATCH |
| From `1.0.0` | Backward-compatible capability | MINOR |
| From `1.0.0` | Incompatible public contract | MAJOR |

A release MUST pass `bun run verify`, update the package version and changelog consistently, and create an annotated `vMAJOR.MINOR.PATCH` tag. Security changes use PATCH unless remediation requires an incompatible public contract.

## Skill selection

- Engineering work MUST use the most relevant available Addy Osmani engineering skill.
- Product-management work MUST use the most relevant available Dean Peters product-management skill.
- Markdown work MUST use `markdown-writing-portability`.
- The selected skill MUST be stated before work begins and MUST remain subordinate to accepted ADRs, approved SPECs, and explicit human decisions.
