# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`debuggable-eval` is an npm package that makes `eval()` debugger-friendly. It appends `//# sourceURL` pragmas so debuggers and Error stack traces show meaningful script names and line numbers. Built with esbuild, strict TypeScript, ESLint, dprint, commitlint, cspell, markdownlint, and vitest.

## Commands

| Task              | Command                               |
|-------------------|---------------------------------------|
| Build             | `npm run build`                       |
| TypeScript check  | `npx tsc --noEmit`                    |
| Lint              | `npm run lint`                        |
| Lint (fix)        | `npm run lint:fix`                    |
| Format            | `npm run format`                      |
| Format (check)    | `npm run format:check`                |
| Spellcheck        | `npm run spellcheck`                  |
| Markdown lint     | `npm run lint:md`                     |
| Markdown lint fix | `npm run lint:md:fix`                 |
| Test              | `npm test`                            |
| Test (coverage)   | `npm run test:coverage`               |
| Commit (wizard)   | `npm run commit`                      |

## Architecture

- **Root config files** are thin re-exports — actual logic lives in `scripts/`:
  - `eslint.config.mts` -> `scripts/eslint-config.ts`
  - `commitlint.config.ts` -> `scripts/commitlint-config.ts`
  - `vitest.config.ts` -> `scripts/vitest-config.ts`
  - `.markdownlint-cli2.mjs` -> `scripts/markdownlint-cli2-config.ts`
  - `.nano-staged.mjs` -> `scripts/nano-staged-config.ts`
- **`scripts/`** — all npm script entry points (`jiti scripts/<name>.ts`)
- **`scripts/helpers/`** — the repo's own script wrappers (format, markdownlint). Generic helpers come from the published packages rather than local copies: `lint` (which tells a crashed ESLint apart from lint findings) from `@mnaoumov/typescript-dev-toolkit/linters/eslint`, `execFromRoot` / `getRootFolder` from `@mnaoumov/typescript-dev-toolkit/root`, `toPosixPath` and the type guards from `@mnaoumov/typescript-lib`. Do not copy a helper back in; if one is missing, get it exported from its package.
- **Custom ESLint rules** (`no-async-callback-to-unsafe-return`, `no-used-underscore-variables`) are imported from `@mnaoumov/typescript-dev-toolkit/linters/eslint-rules/*` in `scripts/eslint-config.ts` and registered there under the `custom/` namespace.
- **Type checking** — `tsconfig.json` sets `skipLibCheck: true` because markdownlint 0.42.0's own `lib/resolve-module.d.cts` fails TS2309 (reached through `markdownlint-rule-relative-links`). `scripts/build-types.ts` then re-checks every `tsconfig.json` file with `skipLibCheck: false` through `checkProjectTypes()` and reports only diagnostics in this repo's own files, printing how many upstream ones it ignored. When that count reads `0`, set `skipLibCheck` back to `false` and drop the step.
- **`src/`** — library source code
  - `src/index.ts` — main entry point exporting `debuggableEval`
  - `src/index.test.ts` — vitest tests colocated with source

## Releasing

`npm run version <patch|minor|major|x.y.z>` checks, bumps, tags, pushes and creates the GitHub release, then watches `.github/workflows/publish-npm.yml`, which publishes to npm through a Trusted Publisher (OIDC, no token on this machine). The workflow's filename is part of the npm-side Trusted Publisher configuration, so do not rename it. A tag whose publish failed is re-published by re-running that run, or by dispatching the workflow with its `tag` input.
