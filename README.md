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

## License

MIT - [Michael Naumov](https://github.com/mnaoumov/)
