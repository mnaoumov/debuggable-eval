<p align="center">
 <h2 align="center">:package: debuggable-eval</h2>
 <p align="center">Makes eval() debugger-friendly with ability to set breakpoints and see proper line numbers in the Error stack traces</p>
  <p align="center">
    <a href="https://github.com/mnaoumov/debuggable-eval/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/mnaoumov/debuggable-eval?style=flat&color=336791" />
    </a>
    <a href="https://github.com/mnaoumov/debuggable-eval/pulls">
      <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/mnaoumov/debuggable-eval?style=flat&color=336791" />
    </a>
     <a href="https://github.com/mnaoumov/debuggable-eval">
      <img alt="GitHub Downloads" src="https://img.shields.io/npm/dw/debuggable-eval?style=flat&color=336791" />
    </a>
    <a href="https://github.com/mnaoumov/debuggable-eval">
      <img alt="GitHub Total Downloads" src="https://img.shields.io/npm/dt/debuggable-eval?color=336791&label=Total%20downloads" />
    </a>
    <a href="https://github.com/mnaoumov/debuggable-eval">
      <img alt="GitHub release" src="https://img.shields.io/github/release/mnaoumov/debuggable-eval.svg?style=flat&color=336791" />
    </a>
    <br />
    <br />
    <a href="https://github.com/mnaoumov/debuggable-eval/issues/new/choose">Report Bug</a>
    <a href="https://github.com/mnaoumov/debuggable-eval/issues/new/choose">Request Feature</a>
  </p>
</>

# NPM Module debuggable-eval

[![codecov](https://codecov.io/gh/mnaoumov/debuggable-eval/branch/main/graph/badge.svg?token=Q9fr548J0D)](https://codecov.io/gh/mnaoumov/debuggable-eval)

Makes eval() debugger-friendly with ability to set breakpoints and see proper line numbers in the Error stack traces

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

## 📝 License

Copyright © 2024 [Michael Naumov](https://github.com/mnaoumov).

This project is [MIT](LICENSE.md) licensed.
