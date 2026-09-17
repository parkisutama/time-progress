---
title: Decision and Documentation System
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers, contributors, and AI coding agents
content_type: explanation
tags:
  - governance
  - decisions
  - documentation
  - explanation
---

# Decision and documentation system

This repository is maintained by people and by AI coding agents.
Both lose context over time, in different ways, and the documentation system is designed around that fact.

## The problem: context decays

Code shows what the system does.
It does not show why it does it, what else was considered, or which constraints made the choice reasonable.

People forget those reasons within months.
AI coding agents start every session without them, and fill the gap with general best practice, which may contradict a decision the project made deliberately.
An agent that does not know *why* Bun is only the package manager might "fix" the build to run on Bun; an agent that does not know about a trust boundary might simplify it away.

The goal is that a reader who arrives a year later, human or agent, can recover the reasoning from the repository alone.

## Each record answers a different question

No single document can hold all context, because different questions have different lifetimes.

| Question | Lifetime | Record |
| --- | --- | --- |
| Why is the system built this way? | Years | ADR |
| What must this capability do? | Until the capability changes | SPEC |
| Why did this diff happen? | Permanent, but local | Commit body |
| What changed for me as a user? | Per release | Changelog |
| How do I do this task? | Until the procedure changes | How-to guide |
| What exactly is the format or rule? | Until the standard changes | Reference |

Records point to each other.
A commit carries `Refs: ADR-003`; an ADR links the SPEC that implements it; a changelog entry describes the effect.
Starting from any one of them, a reader can walk to the others.

## Why decisions are immutable

An accepted ADR is never rewritten.
If a decision changes, a new ADR supersedes the old one.

Rewriting would make the log describe only the present, and the present is already visible in the code.
What a future reader lacks is the history: that option B was tried, or rejected, and why.
Rejected ADRs are kept for the same reason, so that a question closed with evidence is not reopened without new evidence.

The cost is that the log grows and some records describe decisions no longer in force.
Status fields and the index keep that manageable.

## Why agents propose and humans decide

Agents are fast at gathering evidence, listing options, and writing records.
They are not accountable for the product, and they do not carry the decision into the next session.

So the protocol divides the work.
An agent drafts a proposed ADR with genuine options and a recommendation, asks one structured question, and stops.
A maintainer answers, often with a single word, and the agent records the answer with the maintainer's name.

The result is that the slow part for humans, writing, is delegated, and the part that requires accountability, deciding, is not.
It also means the decision is written down at the moment it is made, instead of being lost in a chat transcript.

## Why requirement keywords are rare

BCP 14 keywords (MUST, SHOULD, MAY) were designed for interoperability and for limiting harm, and RFC 2119 asks that they be used sparingly.
When every formatting preference is a MUST, readers and agents cannot tell which rules protect user data.

This repository therefore reserves MUST for security, data integrity, public contracts, irreversible actions, decision traceability, and verification.
Style is SHOULD, and is enforced by tools where possible.
Following RFC 8174, only uppercase words carry this meaning, which is why a security rule written as "must" in lowercase was not really a rule.

## Why documentation types are kept apart

Following Diátaxis, a document serves one need: learning, doing, looking up, or understanding.
A reference that stops to explain rationale becomes slow to consult; a how-to guide that teaches becomes hard to follow under time pressure.

ADRs hold rationale, so reference documents can stay factual and how-to guides can stay short.
The documentation set is improved one document at a time, rather than by creating empty sections that promise content which does not exist.

## Why standards are pinned to versions

The repository names exact versions: Conventional Commits 1.0.0-beta.4, Keep a Changelog 1.1.0, Semantic Versioning 2.0.0.
Standards evolve, and an unpinned reference changes meaning without anyone deciding it.
For example, Conventional Commits 1.0.0 relaxed a rule that beta.4 applies: in beta.4 a breaking change needs the `BREAKING CHANGE:` text even when marked with `!`.

Moving to a newer version is possible, but it is a decision, and it is recorded as one.

## Trade-offs

The system costs time.
Writing an ADR takes longer than making a choice in a pull request, and pinned standards occasionally feel dated.

The triggers in `AGENTS.md` limit that cost to decisions that are expensive to reverse.
For everything else, a clear commit body is enough.
