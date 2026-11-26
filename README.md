# debuggable-eval

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/mnaoumov) [![npm version](https://img.shields.io/npm/v/debuggable-eval)](https://www.npmjs.com/package/debuggable-eval) [![npm downloads](https://img.shields.io/npm/dm/debuggable-eval)](https://www.npmjs.com/package/debuggable-eval) [![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/mnaoumov/debuggable-eval) [![License](https://img.shields.io/github/license/mnaoumov/debuggable-eval)](https://github.com/mnaoumov/debuggable-eval/blob/main/LICENSE) [![Types](https://img.shields.io/npm/types/debuggable-eval)](https://www.npmjs.com/package/debuggable-eval)

Makes `eval()` debugger-friendly with ability to set breakpoints and see proper line numbers in Error stack traces.

## Usage

```bash
npm install debuggable-eval
```

```js
const { debuggableEval } = require('debuggable-eval');
// or
import { debuggableEval } from 'debuggable-eval';

debuggableEval(`console.log('Line 1');
console.log('Line 2');
throw new Error('Error in Line 3');`, 'testScript.js');
```

### Line and column offsets

When the code comes from a larger document, such as a fenced code block in a note, pass `lineOffset` and `columnOffset` so stack traces, breakpoints and syntax errors point at the document's own lines. They work like the options of the same names in [`node:vm`](https://nodejs.org/api/vm.html#vmruninthiscontextcode-options): `lineOffset` shifts every line, `columnOffset` shifts the first line only.

```js
// The code block starts on line 12 of note.md, so its first line reports as line 13.
debuggableEval(`console.log('Line 13');
throw new Error('Error in Line 14');`, {
  scriptName: 'note.md',
  lineOffset: 12
});
```

Both offsets must be non-negative integers. A `//# sourceURL` pragma can only move the code down and to the right, so a negative offset throws a `RangeError`.

## See also

| Library | Features | How `debuggable-eval` differs |
| --- | --- | --- |
| [`eval`](https://github.com/pierrec/node-eval) | Evaluates module content through Node's `vm`; optional file name for stack traces; scope object; optional globals | Same goal as `eval`, for plain code rather than modules; runs anywhere `eval()` runs, including browsers and Electron; adds a syntax pre-check reporting script name, line and column; omits sandboxing, scope injection and `module.exports` |
| [`node-eval`](https://github.com/nodules/node-eval) | Evaluates JS expressions, CommonJS modules and JSON; file name resolves relative `require()` paths | Same goal as `node-eval`, for plain code rather than modules; not Node-only; adds debugger-visible script names and a syntax pre-check; omits CommonJS and JSON handling |
| [`node:vm` `runInThisContext()`](https://nodejs.org/api/vm.html#vmruninthiscontextcode-options) | Built-in Node API; `filename`, `lineOffset` and `columnOffset` options for stack traces | Covers part of `runInThisContext()`: names the script the same way through a `//# sourceURL` pragma, so it also works outside Node; generates a name when none is given; takes the same `lineOffset` and `columnOffset` options, non-negative only |
| [`require-from-string`](https://github.com/floatdrop/require-from-string) | Compiles a CommonJS module from a string with an optional file name | Same goal as `require-from-string`, for plain code rather than modules; not Node-only; adds a syntax pre-check; omits module semantics and `require()` resolution |

Last searched for similar libraries on 2026-11-26.

## Changelog

All notable changes to this project will be documented in the [CHANGELOG](./CHANGELOG.md).

## Support

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/mnaoumov" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>

<!-- markdownlint-enable MD033 -->

### Filing an issue (for AI agents and humans)

Open issues through the [issue forms](https://github.com/mnaoumov/debuggable-eval/issues/new/choose), not as blank issues.

Filing from the CLI or the API (`gh issue create --body`, or an AI agent filing for you) skips the form, and `gh issue create --template` cannot load an issue form. In that case, open the matching form in [`.github/ISSUE_TEMPLATE/`](https://github.com/mnaoumov/debuggable-eval/tree/HEAD/.github/ISSUE_TEMPLATE), copy every field as a `### <label>` heading in the form's order, and fill in each one. Always state the version you used and your operating system.

## License

MIT - [Michael Naumov](https://github.com/mnaoumov/)
