# debuggable-eval

Makes `eval()` debugger-friendly with ability to set breakpoints and see proper line numbers in Error stack traces.

[![npm version](https://img.shields.io/github/release/mnaoumov/debuggable-eval.svg?style=flat&color=336791)](https://github.com/mnaoumov/debuggable-eval)
[![npm downloads](https://img.shields.io/npm/dw/debuggable-eval?style=flat&color=336791)](https://www.npmjs.com/package/debuggable-eval)
[![codecov](https://codecov.io/gh/mnaoumov/debuggable-eval/branch/main/graph/badge.svg?token=Q9fr548J0D)](https://codecov.io/gh/mnaoumov/debuggable-eval)

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

## See also

[My other Obsidian resources](https://mnaoumov.dev/obsidian/)

| Library | Features | How `debuggable-eval` differs |
| --- | --- | --- |
| [`eval`](https://github.com/pierrec/node-eval) | Evaluates module content through Node's `vm`; optional file name for stack traces; scope object; optional globals | Same goal as `eval`, for plain code rather than modules; runs anywhere `eval()` runs, including browsers and Electron; adds a syntax pre-check reporting script name, line and column; omits sandboxing, scope injection and `module.exports` |
| [`node-eval`](https://github.com/nodules/node-eval) | Evaluates JS expressions, CommonJS modules and JSON; file name resolves relative `require()` paths | Same goal as `node-eval`, for plain code rather than modules; not Node-only; adds debugger-visible script names and a syntax pre-check; omits CommonJS and JSON handling |
| [`node:vm` `runInThisContext()`](https://nodejs.org/api/vm.html#vmruninthiscontextcode-options) | Built-in Node API; `filename`, `lineOffset` and `columnOffset` options for stack traces | Covers part of `runInThisContext()`: names the script the same way through a `//# sourceURL` pragma, so it also works outside Node; generates a name when none is given; omits line and column offsets |
| [`require-from-string`](https://github.com/floatdrop/require-from-string) | Compiles a CommonJS module from a string with an optional file name | Same goal as `require-from-string`, for plain code rather than modules; not Node-only; adds a syntax pre-check; omits module semantics and `require()` resolution |

Last searched for similar libraries on 2026-11-04.

## Support

[Buy Me A Coffee](https://www.buymeacoffee.com/mnaoumov)

### Filing an issue (for AI agents and humans)

Open issues through the [issue forms](https://github.com/mnaoumov/debuggable-eval/issues/new/choose), not as blank issues.

Filing from the CLI or the API (`gh issue create --body`, or an AI agent filing for you) skips the form, and `gh issue create --template` cannot load an issue form. In that case, open the matching form in [`.github/ISSUE_TEMPLATE/`](https://github.com/mnaoumov/debuggable-eval/tree/HEAD/.github/ISSUE_TEMPLATE), copy every field as a `### <label>` heading in the form's order, and fill in each one. Always state the version you used and your operating system.

## License

MIT - [Michael Naumov](https://github.com/mnaoumov/)
