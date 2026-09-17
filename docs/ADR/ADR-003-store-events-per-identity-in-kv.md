---
title: "ADR-003: Store Events Per Identity in KV"
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers, contributors, and AI coding agents
content_type: explanation
status: accepted
date: 2026-09-17
decision-makers:
  - Parkis Utama
consulted:
  - AI coding agent (governance audit, 2026-09-17)
informed: []
supersedes: []
superseded-by: []
tags:
  - architecture
  - decision
  - persistence
  - data-integrity
---

# ADR-003: Store events per identity in KV

## Summary

In the context of persisting personal events for the web application,
facing a confirmed defect in which one invalid stored record causes the next write to erase every event of that user,
we decided for keeping one Workers KV list per identity with fail-closed reads and writes and visible client synchronization failures
and neglected the unchanged current design, one KV key per event, and Cloudflare D1,
to achieve data integrity with the smallest change to the current contract,
accepting that concurrent writes still resolve as last write wins and that the storage model is revisited for the desktop edition.

## Context and problem statement

The current design was introduced before this ADR and is recorded here so that the decision is explicit.

Server, in `src/routes/events/+server.ts`:

- All events of a user are one JSON array under the KV key `events:<email>`.
- Every write reads the array, changes it in memory, and writes the whole array back.
- `parseEventList` in `src/lib/event-schema.ts` validates the whole array with strict schemas and a limit of 500 events, and returns an empty array when any part is invalid.
- A write that follows such a read replaces the stored array with the new, shorter array.

Client, in `src/lib/events.ts`:

- Events are cached in `localStorage` under `tp:events:v1` and changed locally first.
- Changes are sent with `fetch` without checking the response status; network errors are ignored.
- On page load, a successful `GET /events` replaces the local list.
- Without an identity, the server responds 401 and the client stays local-only.

Observed consequences:

- **Confirmed data loss.** With 501 stored events, one `POST /events` stores a single event. A test run on 2026-09-17 reproduced this.
- A local change that the server rejected (for example with 422) or never received is discarded on the next page load.
- Workers KV is eventually consistent, and read-modify-write on one key means concurrent writes from two devices keep only the last write.

How should events be stored and synchronized so that validation failures never destroy data?

## Decision drivers

- Stored user data must never be destroyed as a side effect of validation or a failed read.
- Users are isolated by identity.
- Change the public contract as little as possible (see ADR-004).
- The browser keeps working when the server is unreachable.
- The planned Tauri and SQLite desktop edition needs a migration path.
- Operational cost and the number of Cloudflare resources stay small.

## Considered options

1. Keep the current design unchanged.
2. Keep one list per identity, with fail-closed integrity and visible synchronization failures.
3. Store one KV key per event and list events by key prefix.
4. Store events in a Cloudflare D1 (SQLite) table.

## Decision outcome

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" in this section are to be interpreted as described in BCP 14 (RFC 2119, RFC 8174) when, and only when, they appear in all capitals, as shown here.

Proposed option: 2, "One list per identity with fail-closed integrity", because it removes the data-loss path without a storage migration.

- A read MUST distinguish "no stored data" from "stored data that cannot be parsed or validated".
- A write MUST NOT proceed when the stored data for that identity cannot be parsed or validated.
- Individual stored records that fail validation MUST be preserved in storage; they MAY be excluded from responses.
- The event limit MUST be enforced when a write would exceed it, not by discarding data on read.
- The client MUST keep a local change that the server has not acknowledged, and SHOULD show the user that it is not synchronized.
- Response status codes and client behavior are defined in a SPEC before implementation.

### Consequences

- Good, because no code path erases stored events after a validation failure.
- Good, because the KV key format and record schema stay the same.
- Bad, because an unreadable stored list blocks writes for that user until it is repaired, which needs an operator procedure.
- Bad, because concurrent writes from several devices still keep only the last write.
- Neutral, because the storage model will be reconsidered with the desktop edition.

### Confirmation

- A regression test stores 501 events, sends `POST /events`, and asserts that no stored event is lost.
- Integration tests cover missing, malformed JSON, invalid record, and over-limit stored data for each write method.
- A client test shows that a change rejected by the server remains in local state after reload.

## Pros and cons of the options

### Current design unchanged

- Good, because it needs no work.
- Bad, because it loses user data in a reproducible case.

### One list with fail-closed integrity

- Good, because it is the smallest change that removes the data-loss path.
- Bad, because the list size limit and last-write-wins behavior remain.

### One KV key per event

- Good, because a write touches one event, which removes whole-list overwrites and the list size limit.
- Bad, because listing by prefix is also eventually consistent, costs list operations, and changes the stored data format.

### Cloudflare D1

- Good, because transactions and constraints protect integrity, and SQLite matches the planned desktop edition.
- Bad, because it adds a binding, schema migrations, and a data migration from KV.

## More information

- [ADR-002](ADR-002-verify-cloudflare-access-identity.md) decides how the identity that selects the key is established.
- [ADR-004](ADR-004-declare-public-contract-and-versioning.md) decides whether the stored formats are part of the public contract.
- [Threat model](../explanation/threat-model.md): stored data integrity.
- Reopen when multi-device editing becomes a requirement, or when the desktop edition ADR is written.
