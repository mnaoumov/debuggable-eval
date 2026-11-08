# CHANGELOG

## 2.3.0

This release has 2 new features and 2 documentation changes. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- **scripts:** add `check:vendored-eslint-rules`, which checks the two hand-copied ESLint rule sources against obsidian-dev-utils, and bring both copies back in line with it
- enforce 100% test coverage via the test-coverage script

### Documentation

- document the vendored ESLint rule-source gate
- migrate to AGENTS.md

## 2.2.1

This release has maintenance changes only. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

## 2.2.0

This release has 1 breaking change, 2 new features, 2 fixes and 1 other change. 3 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Breaking changes

- migrate to typescript-template toolchain with vitest

### New

- add version script and dual CJS/ESM build
- use acorn parser for syntax checking

### Fixed

- **lint:** add TSAsExpression TSTypeLiteral selector and fix violations
- use node: protocol prefix in dynamic

### Other changes

- Update templates

## 2.1.1

This release has 2 other changes.

### Other changes

- Change slashes
- Allow /

## 2.1.0

This release has 1 other change.

### Other changes

- Encode URI

## 2.0.3

This release has 1 other change.

### Other changes

- Output cjs

## 2.0.2

This release has 1 other change.

### Other changes

- Fix deploy

## 2.0.1

This release has 1 other change.

### Other changes

- Fix deploy

## 2.0.0

This release has 3 other changes.

### Other changes

- Use global eval
- Use hash-based scriptName
- Use named imports

## 1.2.0

This release has 1 other change.

### Other changes

- Remove sourceMappingURL as it was used mistakenly

## 1.1.0

This release has 1 other change.

### Other changes

- Fix breaking code on bundling

## 1.0.0

This release has 1 other change.

### Other changes

- Initial version
