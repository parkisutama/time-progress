---
title: Threat Model
created: 2026-09-17T01:50
modified: 2026-09-17T02:45
audience: maintainers, security reviewers, contributors, and AI coding agents
content_type: explanation
tags:
  - security
  - explanation
---

# Threat model

## Scope

This model covers the SvelteKit application deployed to Cloudflare Workers, Cloudflare Access identity headers, browser storage, and the `EVENTS` KV namespace.

## Assets

- User identity email supplied by Cloudflare Access.
- Per-user event names, details, and timestamps.
- Integrity and availability of deployed Worker code and its dependency chain.

## Trust boundaries

1. Browser to Worker: request bodies, headers, and client state are untrusted.
2. Cloudflare Access to Worker: identity is accepted only behind the configured Access policy.
3. Worker to KV: stored JSON may be malformed or stale and is revalidated when read.
4. Git and registry to CI: workflow actions, packages, and lockfile changes are supply-chain input.
5. AI agent to repository: generated code and commands receive the same review and verification as human work.

## Primary threats and controls

| Threat | Current control | Residual risk |
| --- | --- | --- |
| Identity spoofing | Cloudflare Access protects `/events`; handlers also require `locals.user` | The Worker trusts the email header without verifying the Access token; any route that bypasses Access allows a forged identity. See [ADR-002](../ADR/ADR-002-verify-cloudflare-access-identity.md) |
| Development bypass in production | Bypass works only for loopback hosts and `.dev.vars` is ignored | A future auth change could reintroduce a production bypass; tests guard the current contract |
| Cross-user data access | KV keys are derived from the authenticated email | Depends on the identity control above; email normalization and identity-provider changes require review |
| Stored data loss | Strict Valibot schemas validate KV reads | **Known defect:** when any stored record or the list size fails validation, the next write replaces all of that user's events. See [ADR-003](../ADR/ADR-003-store-events-per-identity-in-kv.md) |
| Silent client and server divergence | Local changes are cached in `localStorage` | Server rejections are ignored, and a later successful load discards unsynchronized local changes. See ADR-003 |
| Malformed or over-posted event data | Strict Valibot schemas validate writes | Request-size and rate limits are provided by platform configuration, not this code |
| XSS and clickjacking | Svelte escapes text; browser hardening headers deny framing and MIME sniffing | A strict CSP still needs browser validation before enforcement |
| Dependency compromise | One Bun lockfile, frozen CI install, audit, Dependabot | Audits detect known advisories, not a newly malicious release |
| AI-generated unsafe changes | `AGENTS.md` decision protocol, review checklist, explicit approval gates, CI | Human review remains required for security and deployment decisions |

## Review triggers

Revisit this document when authentication, storage, external services, CORS, file handling, AI features, or deployment exposure changes, and when an ADR that it references is decided.
