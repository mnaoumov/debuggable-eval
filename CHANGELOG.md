# CHANGELOG

## 2.3.0

- docs: document the vendored ESLint rule-source gate
- feat(scripts): add `check:vendored-eslint-rules`, which checks the two hand-copied ESLint rule sources against obsidian-dev-utils, and bring both copies back in line with it
- docs: migrate to AGENTS.md
- build: replace commitizen with czg
- feat: enforce 100% test coverage via the test-coverage script

## 2.2.1

- chore: ignore archive

## 2.2.0

- refactor: emit explicit .d.cts and .d.mts type declarations
- feat: add version script and dual CJS/ESM build
- fix(lint): add TSAsExpression TSTypeLiteral selector and fix violations
- style: reorder exported function
- refactor(test): use dedent for readable multiline string constants
- feat: use acorn parser for syntax checking
- fix: use node: protocol prefix in dynamic
- refactor!: migrate to typescript-template toolchain with vitest
- Update templates

## 2.1.1

- Change slashes
- Allow /

## 2.1.0

- Encode URI

## 2.0.3

- Output cjs

## 2.0.2

- Fix deploy

## 2.0.1

- Fix deploy

## 2.0.0

- Use global eval
- Use hash-based scriptName
- Use named imports

## 1.2.0

- Remove sourceMappingURL as it was used mistakenly

## 1.1.0

- Fix breaking code on bundling

## 1.0.0

- Initial version
