---
title: Changelog
created: 2026-09-17T01:50
modified: 2026-09-17T02:45
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

- Automated quality checks, CodeQL analysis, and Dependabot updates for Bun and GitHub Actions.
- Architecture decision records, specification templates, how-to guides, and reference standards so that maintainers and AI coding agents can recover why the system is built the way it is.

### Changed

- Require Node 24 as the application runtime while retaining Bun as the package manager.
- Validate event data at browser, API, and persistence trust boundaries.

### Security

- Restrict the development authentication bypass to local requests.
- Add baseline browser hardening headers and dependency auditing.

[Unreleased]: https://github.com/parkisutama/time-progress/commits/main
