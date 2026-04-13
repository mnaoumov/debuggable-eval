# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`debuggable-eval` is an npm package that makes `eval()` debugger-friendly. It appends `//# sourceURL` pragmas so debuggers and Error stack traces show meaningful script names and line numbers. Built with esbuild, strict TypeScript, ESLint, dprint, commitlint, cspell, markdownlint, and vitest.

## Commands

| Task              | Command                 |
|-------------------|-------------------------|
| Build             | `npm run build`         |
| TypeScript check  | `npx tsc --noEmit`      |
| Lint              | `npm run lint`          |
| Lint (fix)        | `npm run lint:fix`      |
| Format            | `npm run format`        |
| Format (check)    | `npm run format:check`  |
| Spellcheck        | `npm run spellcheck`    |
| Markdown lint     | `npm run lint:md`       |
| Markdown lint fix | `npm run lint:md:fix`   |
| Test              | `npm test`              |
| Test (coverage)   | `npm run test:coverage` |
| Commit (wizard)   | `npm run commit`        |

## Architecture

- **Root config files** are thin re-exports — actual logic lives in `scripts/`:
  - `eslint.config.mts` -> `scripts/eslint-config.ts`
  - `commitlint.config.ts` -> `scripts/commitlint-config.ts`
  - `vitest.config.ts` -> `scripts/vitest-config.ts`
  - `.markdownlint-cli2.mjs` -> `scripts/markdownlint-cli2-config.ts`
  - `.nano-staged.mjs` -> `scripts/nano-staged-config.ts`
- **`scripts/`** — all npm script entry points (`jiti scripts/<name>.ts`)
- **`scripts/helpers/`** — shared utilities (exec, root, format, eslint, markdownlint, type-guards)
- **`scripts/helpers/eslint-rules/`** — custom ESLint rules
- **`src/`** — library source code
  - `src/index.ts` — main entry point exporting `debuggableEval`
  - `src/index.test.ts` — vitest tests colocated with source

## Current Task

None.

## Known Issues

None.
