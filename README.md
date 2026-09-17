---
title: Progressive Time
created: 2026-09-16T23:20
modified: 2026-09-17T02:45
audience: users, contributors, and maintainers
content_type: reference
tags:
  - readme
---

# Progressive Time

Live progress of today, this week, month, quarter, and year, plus countdowns for personal events.

The repository and package are named `time-progress`.

## Background

Progressive Time shows how much of the current day, week, month, quarter, and year has already passed.
It was built to keep that view open in an Obsidian sidebar and a browser tab while planning and reviewing work.
Signed-in users can also track personal events with their own progress and countdowns.

The application is a SvelteKit site deployed to Cloudflare Workers.
Cloudflare Access provides sign-in, and events are stored per user in Workers KV.
The reasons behind these choices are recorded as [architecture decision records](docs/ADR/README.md), and all documentation is listed in the [documentation index](docs/index.md).

## Install

Prerequisites:

- Node, at the version in [`.node-version`](.node-version).
- Bun, at the version in the `packageManager` field of [`package.json`](package.json).

Install the locked dependencies:

```bash
bun install --frozen-lockfile
```

To use the events page locally without Cloudflare Access, create a local identity file:

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` is ignored by Git and only works on `localhost`.

## Usage

Start the development server:

```bash
bun run dev
```

Then open <http://localhost:5173>.

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run test` | Run unit and integration tests |
| `bun run lint` | Check formatting and lint rules |
| `bun run check` | Run type and Svelte diagnostics |
| `bun run verify` | Run every check required before merge |
| `bun run build` | Build the Cloudflare Worker |
| `bun run preview` | Serve the production build locally |

Deployment uses `bun run deploy:workers` and is performed only by maintainers.

## Contributing

Ask questions and propose changes in a [GitHub issue](https://github.com/parkisutama/time-progress/issues).
Open an issue before starting significant work, because changes to behavior or architecture need an approved specification or decision record first.

Pull requests follow [`AGENTS.md`](AGENTS.md), which applies to human contributors and AI coding agents alike, and the pull request template.
Report security vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md).

## License

No license has been chosen yet.
Until a license is added, no permission is granted to copy, modify, or distribute this code.
