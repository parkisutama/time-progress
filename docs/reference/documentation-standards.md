---
title: Documentation Standards
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: contributors, maintainers, and AI coding agents writing documentation
content_type: reference
tags:
  - documentation
  - diataxis
  - markdown
  - reference
---

# Documentation standards

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

This reference covers keyword use, documentation types, frontmatter, portable Markdown, the README profile, and editor settings.
Decision records are covered in [Decision records](decision-records.md).

## Normative keywords

### Boilerplate

A document that uses BCP 14 keywords MUST include this sentence near its beginning:

```text
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
BCP 14 (RFC 2119, RFC 8174) when, and only when, they appear in all
capitals, as shown here.
```

### Where keywords are used

| Document | BCP 14 keywords |
| --- | --- |
| `AGENTS.md`, `.github/copilot-instructions.md` | Yes |
| Reference documents in `docs/reference/` | Yes |
| ADR decision outcome | Yes |
| SPEC requirements | Yes |
| How-to guides, tutorials, explanation | No; use plain imperatives or plain prose |
| `README.md`, `CHANGELOG.md`, `SECURITY.md` | No |

### Strength

| Keyword | Use for |
| --- | --- |
| MUST, MUST NOT, REQUIRED | Security, data integrity, public contracts, irreversible or external actions, decision traceability, verification |
| SHOULD, SHOULD NOT, RECOMMENDED | Conventions with legitimate exceptions, such as style and structure |
| MAY, OPTIONAL | Choices that are genuinely free |

Lowercase "must", "should", and "may" have no BCP 14 meaning.
Requirements that matter MUST be written in uppercase; a lowercase or "never" phrasing is not enforceable.

## Documentation types

Documentation is classified by the reader's need using [Diátaxis](https://diataxis.fr/), not by source-code folder.

### Compass

Answer two questions about the reader, then read the type from the table.

| Reader needs | Reader is | Type |
| --- | --- | --- |
| Practical steps (action) | Learning (study) | Tutorial |
| Practical steps (action) | Working on a goal (work) | How-to guide |
| Propositional knowledge (cognition) | Working on a goal (work) | Reference |
| Propositional knowledge (cognition) | Learning (study) | Explanation |

### Type rules

| Type | Serves | Contains | Avoids | Title and filename |
| --- | --- | --- | --- | --- |
| Tutorial | A newcomer acquiring skill | A guided lesson that reliably succeeds | Choices, alternatives, explanation | "Build …" or "Get started with …" |
| How-to guide | A competent user reaching a real goal | A sequence of actions with a clear start and end | Teaching, digressions, complete reference | "How to …"; `verb-object.md` |
| Reference | A user looking up facts while working | Neutral, complete description structured like the product, with examples | Instructions, opinion, rationale | Noun phrase; `subject.md` |
| Explanation | A reader building understanding | Context, history, alternatives, trade-offs, connections | Step-by-step instructions, exhaustive facts | Topic noun phrase; `subject.md` |

### Records

ADRs and SPECs are records with their own lifecycle rather than a fifth Diátaxis type.

| Record | Diátaxis content | `content_type` |
| --- | --- | --- |
| ADR | Explanation of a decision and its trade-offs | `explanation` |
| SPEC | Reference for required behavior and acceptance | `reference` |
| `CHANGELOG.md` | Reference for released changes | `reference` |
| `README.md` | Entry point that links to the other types | `reference` |

### Locations

| Location | Content |
| --- | --- |
| `docs/tutorials/` | Tutorials |
| `docs/how-to/` | How-to guides |
| `docs/reference/` | Reference |
| `docs/explanation/` | Explanation |
| `docs/ADR/` | Architecture decision records |
| `docs/SPEC/` | Specifications |

- A directory SHOULD be created only together with its first document.
- Placeholder documents SHOULD NOT be created.
- Adding, moving, or removing a document SHOULD update [`docs/index.md`](../index.md) in the same change.

### Evolving the documentation set

- Improve the document you are already changing; do not restructure the whole set at once.
- Each change SHOULD leave the documentation complete (accurate and useful at its current stage), even if not finished.
- When a document starts serving a second need, split it and link the parts.

## Frontmatter

Every Markdown document SHOULD begin with YAML frontmatter.

| Field | Value |
| --- | --- |
| `title` | Title Case name of the document |
| `created` | `YYYY-MM-DDTHH:mm`, local time, set once |
| `modified` | `YYYY-MM-DDTHH:mm`, updated when the meaning of the content changes |
| `audience` | Primary persona or personas |
| `content_type` | `tutorial`, `how-to`, `reference`, or `explanation` |
| `tags` | Multiline YAML list |

- The audience is declared only in frontmatter; do not repeat it as a body line or heading.
- ADRs and SPECs add record fields defined in [Decision records](decision-records.md).
- Files that tools copy or parse verbatim SHOULD NOT use this frontmatter: `.github/PULL_REQUEST_TEMPLATE.md` and files in `.github/ISSUE_TEMPLATE/`.

## Portable Markdown

Markdown SHOULD render correctly on GitHub, CommonMark, GFM, MkDocs, Pandoc, Typora, and Obsidian.
The `markdown-writing-portability` skill is the detailed authority; the rules most often missed are:

- One H1 per document; ATX headings; no skipped levels; no duplicate heading text.
- Standard links `[text](path.md)`; no wikilinks; no bare URLs (use `<https://…>` or a link).
- `-` for unordered lists; four spaces for nested list indentation.
- `*` and `**` for emphasis, never underscores.
- Fenced code blocks with a language; `text` for plain output.
- Compact GFM tables with leading and trailing pipes and `| --- |` delimiters.
- GitHub alerts only: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.
- Semantic line breaks: one sentence per line, with long sentences broken at clause boundaries, never at a fixed column.
- No trailing spaces, tabs, or consecutive blank lines.

Markdown rules are not yet enforced by an automated linter; reviewers check them.

## README profile

`README.md` follows [Standard Readme](https://github.com/RichardLitt/standard-readme) with these sections, in this order:

| Section | Rule |
| --- | --- |
| Title | Product name; note that the repository and package are named `time-progress` |
| Short description | One line under 120 characters, identical to `description` in `package.json` and the GitHub repository description |
| Table of contents | Only when the README exceeds 100 lines |
| Background | Motivation and a link to `docs/index.md` |
| Install | Prerequisites and commands in code blocks |
| Usage | Commands in code blocks |
| Contributing | Where to ask questions, how contributions are accepted, and a link to `AGENTS.md` |
| License | Last section; SPDX identifier and owner, or a statement that no license is granted |

Optional Standard Readme sections (banner, badges, API, maintainers, thanks) are added only when they carry information.

## Editor settings

[EditorConfig](https://editorconfig.org/) aligns editors with the formatter; Biome remains the authority for code formatting.

| Files | Indentation | Notes |
| --- | --- | --- |
| All | — | UTF-8, LF, final newline, trimmed trailing whitespace |
| `*.{js,mjs,cjs,ts,svelte,json,jsonc,css,html}` | Tab, displayed as 2 columns | Matches `biome.json`; 100-column guide |
| `*.md` | 4 spaces | Nested list indentation |
| `*.{yml,yaml,toml}` | 2 spaces | — |

Line endings are also enforced for Git by `.gitattributes`.
