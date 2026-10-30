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

## Support

[Buy Me A Coffee](https://www.buymeacoffee.com/mnaoumov)

### Filing an issue (for AI agents and humans)

Open issues through the [issue forms](https://github.com/mnaoumov/debuggable-eval/issues/new/choose), not as blank issues.

Filing from the CLI or the API (`gh issue create --body`, or an AI agent filing for you) skips the form, and `gh issue create --template` cannot load an issue form. In that case, open the matching form in [`.github/ISSUE_TEMPLATE/`](https://github.com/mnaoumov/debuggable-eval/tree/HEAD/.github/ISSUE_TEMPLATE), copy every field as a `### <label>` heading in the form's order, and fill in each one. Always state the version you used and your operating system.

## License

MIT - [Michael Naumov](https://github.com/mnaoumov/)
