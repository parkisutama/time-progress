---
title: "SPEC-001: Event Persistence Integrity"
created: 2026-09-17T07:52
modified: 2026-09-17T07:58
audience: signed-in event users and implementation reviewers
content_type: reference
status: approved
owner: repository maintainers
approvers:
  - Parkis Utama
target-release: unscheduled
tags:
  - specification
  - persistence
  - data-integrity
---

# SPEC-001: Event persistence integrity

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

## Summary

Signed-in users keep every event they have stored, even when stored data fails validation or a change does not reach the server.
The `/events` handlers refuse to write over data they cannot read and report that with a status code,
and the browser keeps changes the server has not acknowledged.
This implements [ADR-003](../ADR/ADR-003-store-events-per-identity-in-kv.md) and fixes a data-loss defect reproduced on 2026-09-17.

## Problem

- With 501 events stored, one `POST /events` leaves a single stored event.
  `parseEventList` returns an empty list when any record or the list size fails validation, and the write replaces the stored list with that empty list plus the new event.
- The same happens after one invalid stored record or malformed stored JSON.
- `PATCH` and `DELETE` on such data respond 404 for events that exist.
- The browser ignores non-2xx responses and network errors, and replaces its local list on the next successful `GET /events`, so changes the server never stored disappear.

If nothing changes, a single bad record permanently erases a user's events on their next change.

## Personas

- Signed-in user: tracks personal events across page loads and devices, and expects an event to stay until they delete it.
- Maintainer or operator: needs a visible signal when a user's stored data is unreadable, so that it can be repaired instead of silently overwritten.

## Goals

- No request to `/events` reduces or alters stored events other than the event it targets.
- Every failure to read stored data is visible as a status code.
- A local change is lost only when the user discards it, never because the server rejected or missed it.

## Non-goals

- Synchronization while no page is open, such as a service worker or background sync.
- Conflict resolution for concurrent edits from several devices; last write still wins, as accepted in ADR-003.
- Repairing unreadable stored data; that needs an operator procedure.
- Recovering unreadable browser `localStorage` content.
- Changing success status codes or response bodies, or introducing structured error bodies.

## User journeys

### Journey: create with unreadable stored data

1. A signed-in user whose stored data contains an invalid record creates an event.
2. The event appears locally and is marked as not synchronized.
3. The server responds with an error and leaves the stored data unchanged.
4. After a reload, the event is still shown locally and still marked as not synchronized.
5. After an operator repairs the stored data, the next automatic retry stores the event and removes the label.

### Journey: create beyond the event limit

1. A signed-in user who already has 500 or more stored events creates an event.
2. The server refuses the new event and leaves the stored events unchanged.
3. The event stays in the local list, marked as not synchronized.
4. The user can still edit and delete their existing events.
5. After the user deletes an event, the next page load retries the create and stores the event.

### Journey: change while offline

1. A signed-in user edits an event while the network is unavailable.
2. The change is kept locally and marked as not synchronized.
3. When the browser reports that it is online again, the client sends the change without user action and removes the label.

## Requirements

### Server

| ID | Requirement |
| --- | --- |
| REQ-1 | The server MUST classify the stored value for an identity as *absent* (no value), *readable* (a JSON array in which every element satisfies `EventSchema`), or *unreadable* (anything else). |
| REQ-2 | Reading stored data MUST NOT apply the event limit; a readable list of any length is returned or updated in full. |
| REQ-3 | `GET /events` MUST respond `200` with `[]` for absent data and with every stored event for readable data. |
| REQ-4 | Every `/events` method MUST respond `500` when stored data is unreadable, and MUST NOT write to storage. |
| REQ-5 | Every `/events` method MUST respond `500` when the `EVENTS` binding is not configured. |
| REQ-6 | `POST /events` MUST respond `409` and MUST NOT write when the readable list already holds 500 or more events. |
| REQ-7 | `PATCH` and `DELETE` MUST succeed on a readable list of any length when the target event exists. |
| REQ-8 | A successful write MUST keep every stored event other than the target unchanged. |
| REQ-9 | The existing responses remain: `401` without a user, `422` for an invalid request body, `409` for a duplicate `POST` id, `404` for an unknown `PATCH` or `DELETE` id, and `200` on success. |
| REQ-10 | Checks MUST run in this order: authentication, request body validation, stored data and binding checks, then event limit, duplicate, and existence checks. |

### Client

| ID | Requirement |
| --- | --- |
| REQ-11 | The client MUST treat a local change as acknowledged only when the server responds with a `2xx` status. |
| REQ-12 | The client MUST keep a change that is not acknowledged, including after a network error or a `401`, and MUST record the event id as pending. |
| REQ-13 | Pending event ids MUST be stored in `localStorage` under `tp:events:pending:v1`, so that they survive a reload. |
| REQ-14 | When `GET /events` succeeds, the client MUST use the server version of every event that is not pending, and MUST keep the local state of every pending event, including a pending deletion. |
| REQ-15 | When `GET /events` fails or the network is unavailable, the client MUST keep its local list unchanged. |
| REQ-16 | An acknowledged change MUST remove its event id from the pending set. |
| REQ-17 | The client MUST accept a server or `localStorage` list longer than 500 events without discarding it. |
| REQ-18 | The event list SHOULD show a "Not synced" label on each pending event. |

### Automatic retry

| ID | Requirement |
| --- | --- |
| REQ-19 | The client MUST retry every pending event automatically when the page loads, before it requests `GET /events`, and when the browser fires the `online` event. |
| REQ-20 | A retry MUST be derived from the current local state: for a pending event that exists locally, the client sends `PATCH` with its `name`, `detail`, `start`, and `end`, and sends `POST` with the full event if `PATCH` responds `404`; for a pending event that no longer exists locally, the client sends `DELETE`. |
| REQ-21 | A `DELETE` retry that responds `404` MUST count as acknowledged. |
| REQ-22 | After a network error or a `5xx` response, the client MUST schedule another retry while the page stays open, after 5 seconds, 30 seconds, 2 minutes, and then every 10 minutes. The schedule restarts after an acknowledged retry or an `online` event. |
| REQ-23 | After a `401`, `409`, or `422` response, the client MUST keep the event pending and MUST NOT retry it again until the next page load, `online` event, or local change to that event. |
| REQ-24 | The client MUST NOT send more than one request at a time for the same event id. |
| REQ-25 | An acknowledgement MUST NOT clear the pending state when the event changed locally after the acknowledged request was sent; the newer change is then sent. |

## Domain and business rules

- **Event limit**: at most 500 events can be created per identity.
  Lists that already exceed the limit were written before it existed and stay fully usable, except for creating new events.
- **Unreadable stored data**: stored data that is not valid JSON, is not an array, or contains any record that fails `EventSchema`.
  It blocks every request for that identity until an operator repairs it.
- **Pending event**: an event whose latest local create, update, or delete has not been acknowledged by the server.
- Stored data is owned by the authenticated identity; the storage key remains `events:<email>`.

## Security and privacy

- Stored KV data and `localStorage` are untrusted and are validated on every read.
- A failed validation of stored data never causes a write, which enforces the security boundary in `AGENTS.md`.
- Error responses do not include stored content or validation details, so a `500` reveals only that the data is unreadable.
- The pending set stores event ids only.
- The threat model's known-defect notes on stored data loss and client divergence are removed when this SPEC is implemented.
  The residual risks of last-write-wins and unreadable `localStorage` stay recorded.

## Acceptance criteria

```text
AC-1
Given 501 valid events are stored for the user
When the user sends POST /events with a new valid event
Then the response is 409
And all 501 stored events are unchanged
```

```text
AC-2
Given 499 valid events are stored for the user
When the user sends POST /events with a new valid event
Then the response is 200
And 500 events are stored, including the new event and all 499 existing events
```

```text
AC-3
Given 501 valid events are stored for the user
When the user sends PATCH /events renaming one stored event
Then the response is 200
And that event has the new name and the other 500 stored events are unchanged
```

```text
AC-4
Given 501 valid events are stored for the user
When the user sends DELETE /events for one stored event
Then the response is 200
And the other 500 stored events are unchanged
```

```text
AC-5
Given the stored value for the user is malformed JSON
When the user sends POST, PATCH, or DELETE to /events with a valid body
Then the response is 500
And the stored value is unchanged
```

```text
AC-6
Given the stored list for the user contains one record that fails validation
When the user sends POST, PATCH, or DELETE to /events with a valid body
Then the response is 500
And the stored value is unchanged
```

```text
AC-7
Given the stored data for the user is malformed JSON or contains an invalid record
When the user sends GET /events
Then the response is 500
```

```text
AC-8
Given 501 valid events are stored for the user
When the user sends GET /events
Then the response is 200 with all 501 events
```

```text
AC-9
Given the EVENTS binding is not configured
When the user sends GET, POST, PATCH, or DELETE to /events
Then the response is 500
```

```text
AC-10
Given the server responds with a non-2xx status or a network error to a create, update, or delete
When the page is reloaded and GET /events succeeds without that change
Then the local list still contains the change
And the event id is pending
```

```text
AC-11
Given a local list with events
When the page loads and GET /events fails
Then the local list is unchanged
```

```text
AC-12
Given an event id is pending
When the server acknowledges a later change to that event with a 2xx status
Then the event id is no longer pending
```

```text
AC-13
Given GET /events returns 501 events
When the client applies the response
Then the local list and localStorage contain all 501 events
```

```text
AC-14
Given an event created locally is pending because the network was unavailable
When the page loads and the server is reachable
Then the client stores the event on the server before requesting GET /events
And the event id is no longer pending
```

```text
AC-15
Given a pending event exists locally and the server responds 404 to PATCH
When the client retries the event
Then the client sends POST with the full event
And the event id is no longer pending after a 200 response
```

```text
AC-16
Given an event deleted locally is pending
When the client retries it and the server responds 404
Then the event id is no longer pending
```

```text
AC-17
Given a retry failed with a network error or a 5xx response
When 5 seconds, then 30 seconds, then 2 minutes, then every 10 minutes elapse
Then the client retries the pending event at each of those times
```

```text
AC-18
Given a retry was rejected with 401, 409, or 422
When the backoff delays elapse without a page load, online event, or local change
Then the client does not retry the event
And the event id is still pending
```

```text
AC-19
Given an event is pending
When the browser fires the online event
Then the client retries the event immediately
```

```text
AC-20
Given a request for an event is in flight
When the user changes that event and the first request is then acknowledged
Then the event id stays pending until the newer change is acknowledged
And no second request for that event is sent while the first is in flight
```

```text
AC-21
Given an event is pending
When the user opens the event list
Then the event shows a "Not synced" label
```

| Criterion | Requirements | Verification |
| --- | --- | --- |
| AC-1 | REQ-6, REQ-8 | Integration test |
| AC-2 | REQ-6, REQ-8 | Integration test |
| AC-3 | REQ-2, REQ-7, REQ-8 | Integration test |
| AC-4 | REQ-2, REQ-7, REQ-8 | Integration test |
| AC-5 | REQ-1, REQ-4, REQ-10 | Integration test |
| AC-6 | REQ-1, REQ-4, REQ-10 | Integration test |
| AC-7 | REQ-3, REQ-4 | Integration test |
| AC-8 | REQ-2, REQ-3 | Integration test |
| AC-9 | REQ-5 | Integration test |
| AC-10 | REQ-11, REQ-12, REQ-13, REQ-14 | Unit test |
| AC-11 | REQ-15 | Unit test |
| AC-12 | REQ-16 | Unit test |
| AC-13 | REQ-17 | Unit test |
| AC-14 | REQ-19, REQ-20 | Unit test |
| AC-15 | REQ-20 | Unit test |
| AC-16 | REQ-20, REQ-21 | Unit test |
| AC-17 | REQ-22 | Unit test |
| AC-18 | REQ-23 | Unit test |
| AC-19 | REQ-19 | Unit test |
| AC-20 | REQ-24, REQ-25 | Unit test |
| AC-21 | REQ-18 | Manual acceptance |

## Delivery plan

Each task is a separate commit.


1. Server: fail-closed stored data handling and the create-time limit (AC-1 to AC-9).
   The existing test `rejects a malformed persisted list` in `src/lib/event-schema.test.ts` asserts the defect and is replaced by tests of the new read classification.
2. Client refactor without behavior change, so that the store accepts injected `fetch` and storage in tests.
3. Client: pending changes and merge on load (AC-10 to AC-13).
4. Client: automatic retry (AC-14 to AC-20).
5. UI: "Not synced" label (AC-21).
6. Records: threat model, `CHANGELOG.md` `Fixed` entry, and SPEC status.

## Open questions

None.
The approver confirmed the version impact as a backward-compatible fix (PATCH):
the `500` and `409` responses and the new `localStorage` key change the interim public contract only in additive ways.

## Related records

- ADRs: [ADR-003](../ADR/ADR-003-store-events-per-identity-in-kv.md); [ADR-004](../ADR/ADR-004-declare-public-contract-and-versioning.md) for the interim public contract.
- Superseded specifications: none.
