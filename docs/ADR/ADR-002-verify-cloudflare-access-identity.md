---
title: "ADR-002: Verify Cloudflare Access Identity"
created: 2026-09-17T02:45
modified: 2026-09-17T02:45
audience: maintainers, security reviewers, and AI coding agents
content_type: explanation
status: proposed
date: 2026-09-17
decision-makers: []
consulted:
  - AI coding agent (governance audit, 2026-09-17)
informed: []
supersedes: []
superseded-by: []
tags:
  - architecture
  - decision
  - authentication
  - security
---

# ADR-002: Verify Cloudflare Access identity

## Summary

In the context of authenticating requests to the Worker,
facing the risk that a request which did not pass through Cloudflare Access carries a forged identity header,
we propose verifying the Cloudflare Access token in the Worker with Web Crypto
and neglect trusting the email header alone, a JWT library, and application-managed sessions,
to achieve per-user data isolation that does not depend on every route being covered by an Access policy,
accepting two new non-secret configuration values and a small verification cost per request.

## Context and problem statement

The current implementation was introduced before this ADR and is recorded here so that the decision is explicit.

- `validateSession` in `src/lib/server/auth.ts` returns the value of the `Cf-Access-Authenticated-User-Email` request header as the user identity.
- `src/hooks.server.ts` rejects `/events` requests without an identity with 401.
- `src/routes/events/+server.ts` stores each user's events under `events:<email>`, so the identity also selects whose data is read and written.
- A development bypass (`DEV_BYPASS_EMAIL`) is honored only for `localhost`, `127.0.0.1`, and `[::1]`.
- Cloudflare's documentation recommends validating the `Cf-Access-Jwt-Assertion` header at the origin, checking the signature against the team's public keys, the `aud` tag, and the issuer.
- The repository does not record whether every route that reaches this Worker is protected by an Access policy.

If any route reaches the Worker without Access, a client can send any email in the header and read or overwrite that user's events.

Should the Worker trust the identity header, or verify that the request was authenticated by Access?

## Decision drivers

- Cross-user data access must be impossible even if Access configuration drifts.
- Avoid new runtime dependencies when the platform already provides the capability.
- Local development keeps working without Cloudflare Access.
- Operational configuration stays small and contains no secrets.
- Per-request latency stays negligible.

## Considered options

1. Trust the `Cf-Access-Authenticated-User-Email` header (current state).
2. Verify the `Cf-Access-Jwt-Assertion` token in the Worker with Web Crypto.
3. Verify the token with a JWT library such as `jose`.
4. Replace Cloudflare Access with application-managed sessions.

## Decision outcome

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" in this section are to be interpreted as described in BCP 14 (RFC 2119, RFC 8174) when, and only when, they appear in all capitals, as shown here.

Proposed option: 2, "Verify the token with Web Crypto", because it removes the dependency on complete Access route coverage without adding a runtime dependency.

- The Worker MUST derive the user identity from a verified `Cf-Access-Jwt-Assertion` token.
- Verification MUST check the signature against the team's published keys, the `aud` tag, the issuer, and the expiry.
- The identity header alone MUST NOT be accepted as proof of identity.
- The team domain and the application `aud` tag MUST be Worker configuration values, not source constants.
- Public keys SHOULD be cached and refreshed when an unknown key identifier appears.
- The loopback-only development bypass MAY remain.

### Consequences

- Good, because a forged identity header no longer grants access to another user's events.
- Good, because no new dependency is added.
- Bad, because the verification code is security-critical and must be written and reviewed carefully.
- Bad, because deployments need the team domain and `aud` tag configured; a missing value must fail closed with 401.
- Neutral, because Cloudflare Access remains the identity provider.

### Confirmation

- Unit tests cover a valid token, a bad signature, a wrong `aud`, a wrong issuer, an expired token, an unknown key identifier, and a request with only the email header.
- Integration tests show that every `/events` method returns 401 for each rejected case.
- Review confirms the configuration values exist in each deployed environment before release.

## Pros and cons of the options

### Trust the email header

- Good, because it is already implemented and has no configuration.
- Bad, because its safety depends entirely on Access covering every route to the Worker.

### Verify with Web Crypto

- Good, because it follows Cloudflare's recommendation without a dependency.
- Bad, because it is more code to own than a library call.

### Verify with a JWT library

- Good, because a maintained library handles key selection and claim checks.
- Bad, because it adds a runtime dependency to the security boundary, which requires its own review and updates.

### Application-managed sessions

- Good, because authentication would not depend on Cloudflare.
- Bad, because it adds credential storage, session handling, and account recovery that the product does not need.

## More information

- [Validate JWTs (Cloudflare Access)](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)
- [Threat model](../explanation/threat-model.md): identity spoofing and cross-user data access.
- Reopen when the product needs an identity provider other than Cloudflare Access, or when the desktop edition needs offline authentication.
