---
title: Security Policy
created: 2026-09-17T01:50
modified: 2026-09-17T01:50
audience: security reporters, maintainers, and contributors
content_type: reference
tags:
  - security
  - reference
---

# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's **Report a vulnerability** flow under the repository Security tab. Do not open a public issue containing exploit details, credentials, or personal data.

Include the affected path, impact, reproduction steps, and any suggested mitigation. Reports will be acknowledged after they are reviewed and reproduced.

## Supported version

The current production branch, `main`, is the supported version. Security fixes are applied there after verification.

## Security baseline

- Cloudflare Access protects authenticated routes.
- Event API payloads and persisted KV records are validated with Valibot.
- Bun's committed lockfile is installed reproducibly and audited in CI.
- CodeQL analyzes JavaScript and TypeScript changes.
