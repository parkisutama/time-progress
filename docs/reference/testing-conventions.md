---
title: Testing Conventions
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: contributors, reviewers, and AI coding agents writing tests
content_type: reference
tags:
  - testing
  - quality
  - reference
---

# Testing conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) ([RFC 2119](https://www.rfc-editor.org/info/rfc2119), [RFC 8174](https://www.rfc-editor.org/info/rfc8174)) when, and only when, they appear in all capitals, as shown here.

This reference defines test layers, required coverage, test structure, and naming.

## Layers

| Layer | Scope in this repository | Tool | Location | Command |
| --- | --- | --- | --- | --- |
| Unit | Pure logic: schemas, event status and progress, period progress, auth helpers | Vitest | `src/**/*.test.ts`, next to the source | `bun run test` |
| Integration | SvelteKit request handlers and hooks, called with a constructed `Request` and a fake `EVENTS` KV | Vitest | `src/**/*.test.ts`, next to the handler | `bun run test` |
| End-to-end | Critical user journeys in a browser against a production build | Playwright | `e2e/` | `bun run test:e2e` |
| Manual acceptance | Cloudflare Access, deployed bindings, and visual checks | Human | Pull request description | — |

Most tests SHOULD be unit tests, fewer integration tests, and only a small number of end-to-end tests.
`playwright.config.ts` points to `e2e/`, which does not exist yet; `bun run verify` runs unit and integration tests only.

## Required coverage

| Area | Required tests |
| --- | --- |
| Authentication | Every branch of identity resolution, including rejected identities and the development bypass on local and non-local hosts |
| Authorization | Each `/events` method returns 401 without a user, and reads and writes only the current user's key |
| Trust-boundary validation | Each accepted shape and each rejected class, including limits such as name length, detail length, and list size |
| Persistence integrity | Reads of missing, malformed, and oversized stored data, and proof that no write destroys existing records |
| Time calculations | Period boundaries, daylight-saving transitions, non-UTC time zones, and leap years |
| Bug fixes | A regression test that fails before the fix |

Framework behavior, trivial accessors, and generated code are not tested.

## Arrange-Act-Assert

Unit and integration tests use Arrange-Act-Assert (AAA).

- **Arrange** builds inputs and state.
- **Act** calls the one behavior under test.
- **Assert** checks observable outcomes: return values, responses, or stored state.

Rules:

- The three phases SHOULD appear in order and be separated by one blank line.
- `// Arrange`, `// Act`, and `// Assert` comments are used only when blank lines do not make the phases obvious.
- Each test SHOULD have exactly one Act. Several cases of one behavior use `it.each`.
- Assertions SHOULD check outcomes, not private implementation details or call order.
- Repeated arrangement moves to a local builder or fixture. Cleanup (the teardown phase of a four-phase test) uses `afterEach` or `onTestFinished`.

```ts
it('rejects an event that ends before it starts', () => {
  const input = { ...validEvent, end: '2026-09-17T07:00:00.000Z' };

  const result = v.safeParse(CreateEventSchema, input);

  expect(result.success).toBe(false);
});
```

```ts
it.each([
  ['before the start', '2026-09-17T07:59:59.000Z', 'upcoming'],
  ['inside the range', '2026-09-17T09:00:00.000Z', 'active'],
  ['after the end', '2026-09-17T10:00:01.000Z', 'complete']
])('classifies a time %s', (_case, now, expected) => {
  const status = getEventStatus(DateTime.fromISO(now), start, end);

  expect(status).toBe(expected);
});
```

## Given-When-Then

Given-When-Then (GWT) expresses behavior in terms a product owner can read.
It is used for SPEC acceptance criteria, end-to-end tests, and integration tests that verify an acceptance criterion.

| GWT | AAA equivalent |
| --- | --- |
| Given | Arrange |
| When | Act |
| Then | Assert |

- Each acceptance criterion has an `AC-n` identifier; see [Decision records](decision-records.md#requirements-and-acceptance-criteria).
- A test that verifies an acceptance criterion MUST include the identifier in its name.
- The test body still follows AAA.

```ts
describe('SPEC-001 event persistence', () => {
  it('AC-1: keeps existing events when a new event is created', async () => {
    const events = fakeKv({ 'events:user@example.com': threeEvents });

    const response = await POST(createRequest(newEvent, events));

    expect(response.status).toBe(200);
    expect(storedEvents(events)).toHaveLength(4);
  });
});
```

## Names

- `describe` names the unit, handler, or specification under test.
- `it` states the behavior and outcome in the present tense, such as `rejects …`, `returns …`, or `keeps …`.
- A name SHOULD make the failure understandable without reading the test body.

## Determinism

- Tests MUST NOT depend on the current time, the machine time zone, the network, or real Cloudflare resources.
- Pass the current time into the code under test, or use `vi.useFakeTimers()` and `vi.setSystemTime()`.
- Create Luxon values with an explicit zone when the zone matters.
- Replace `fetch` with `vi.stubGlobal` and KV with an in-memory object that implements `get` and `put`.
- Restore stubs and timers after each test.

## Prohibited practices

- Tests and assertions MUST NOT be deleted, skipped, or weakened to make a check pass.
- `.only` MUST NOT be committed.
- A committed `.skip` MUST reference an issue or ADR that explains it.
- A snapshot MUST NOT be the only assertion for logic or contracts.
- A test that documents a known defect MUST be named after the defect and linked to the ADR or issue that tracks it, so that it is not mistaken for intended behavior.
