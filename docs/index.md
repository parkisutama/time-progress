---
title: Documentation Index
created: 2026-09-17T01:50
modified: 2026-09-17T02:00
audience: users, contributors, maintainers, and AI coding agents
content_type: reference
tags:
  - documentation
  - diataxis
---

# Documentation index

## Audience

This index serves users, contributors, maintainers, and AI coding agents who need to locate the right form of documentation.

## Content types

Documentation is classified by reader need using [Diátaxis](https://diataxis.fr/), rather than mirroring the source-code folder structure.

| Content type | Primary persona and need | Location |
| --- | --- | --- |
| Tutorial | New user learning through a guided experience | `docs/tutorials/` |
| How-to guide | User or operator completing a concrete task | `docs/how-to/` |
| Reference | Contributor or integrator needing exact facts and contracts | `docs/reference/` |
| Explanation | Maintainer seeking rationale, concepts, and trade-offs | `docs/explanation/` |
| ADR | Maintainer or agent reviewing durable architectural decisions | `docs/ADR/` |
| SPEC | Product and engineering participants defining intended behavior | `docs/SPEC/` |

The classification is about content purpose. A document MUST move or split when its reader need changes, even if the implementation remains in the same code folder.

## Governance

- [Engineering governance](reference/engineering-governance.md)
- [Architecture decision records](ADR/README.md)
- [Specifications](SPEC/README.md)
- [Definition of done](reference/definition-of-done.md)
- [Threat model](explanation/threat-model.md)
