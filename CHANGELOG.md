---
title: Changelog
created: 2026-09-17T01:50
modified: 2026-09-17T01:50
audience: users, operators, and maintainers
content_type: reference
tags:
  - changelog
  - releases
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/).

## [Unreleased]

### Added

- Establish AI-assisted repository governance, automated quality checks, CodeQL, Dependabot for Bun, ADR and specification workflows, and portable documentation standards.

### Changed

- Require Node 24 as the application runtime while retaining Bun as the package manager.
- Validate event data at browser, API, and persistence trust boundaries.

### Security

- Restrict the development authentication bypass to local requests.
- Add baseline browser hardening headers and dependency auditing.
