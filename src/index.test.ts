import dedent from 'dedent';
import {
  describe,
  expect,
  it
} from 'vitest';

import { debuggableEval } from './index.ts';

interface ErrorWithCause extends Error {
  cause: unknown;
}

const CODE_WITH_ERROR = dedent`
  console.log('Line 1');
  console.log('Line 2');
  throw new Error('Error in Line 3');
  console.log('Line 4');
`;

const CODE_WITH_SYNTAX_ERROR = dedent`
  console.log('Line 1');
  function missingClosingBrace() {
  console.log('Line 3');
`;

function catchError(code: string, scriptName: string): Error | null {
  try {
    debuggableEval(code, scriptName);
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
}

describe('debuggableEval', () => {
  describe('errors', () => {
    it('rethrows runtime errors', () => {
      const error = catchError(CODE_WITH_ERROR, 'testScript.js');
      expect(error).not.toBeNull();
    });

    it('stack contains script name', () => {
      const error = catchError(CODE_WITH_ERROR, 'testScript.js');
      expect(error?.stack).toContain('testScript.js');
    });

    it('stack contains proper error line number', () => {
      const error = catchError(CODE_WITH_ERROR, 'testScript.js');
      const match = /testScript\.js:(?<line>\d+):/.exec(error?.stack ?? '');
      const ERROR_LINE = 3;
      expect(Number(match?.groups?.['line'])).toBe(ERROR_LINE);
    });
  });

  describe('syntax errors', () => {
    it('thrown when the code is invalid', () => {
      const error = catchError(CODE_WITH_SYNTAX_ERROR, 'testScript.js');
      expect(error).toBeInstanceOf(SyntaxError);
    });

    it('message contains script name', () => {
      const error = catchError(CODE_WITH_SYNTAX_ERROR, 'testScript.js');
      expect(error?.message).toContain('testScript.js');
    });

    it('message contains proper line number', () => {
      const error = catchError(CODE_WITH_SYNTAX_ERROR, 'testScript.js');
      const match = /testScript\.js:(?<line>\d+):/.exec(error?.message ?? '');
      const SYNTAX_ERROR_LINE = 3;
      expect(Number(match?.groups?.['line'])).toBe(SYNTAX_ERROR_LINE);
    });

    it('message contains proper column number', () => {
      const error = catchError(CODE_WITH_SYNTAX_ERROR, 'testScript.js');
      const match = /testScript\.js:\d+:(?<column>\d+)/.exec(error?.message ?? '');
      expect(match?.groups?.['column']).toBeDefined();
      expect(Number(match?.groups?.['column'])).toBeGreaterThanOrEqual(0);
    });

    it('preserves original error as cause', () => {
      const error = catchError(CODE_WITH_SYNTAX_ERROR, 'testScript.js');
      expect(error).toHaveProperty('cause');
      expect((error as ErrorWithCause).cause).toBeInstanceOf(SyntaxError);
    });
  });

  describe('script name generation', () => {
    it('generates a script name when none is provided', () => {
      const result = debuggableEval('42');
      const EXPECTED_RESULT = 42;
      expect(result).toBe(EXPECTED_RESULT);
    });
  });

  describe('return value', () => {
    it('returns the result of the evaluated code', () => {
      const EXPECTED = 42;
      const result = debuggableEval('40 + 2', 'add.js');
      expect(result).toBe(EXPECTED);
    });
  });

  describe('sourceURL sanitization', () => {
    it('strips existing sourceURL pragmas from code', () => {
      const maliciousCode = '42\n//# sourceURL=malicious.js';
      const error = catchError(`${maliciousCode}\nthrow new Error('test');`, 'safe.js');
      expect(error?.stack).toContain('safe.js');
      expect(error?.stack).not.toContain('malicious.js');
    });
  });
});
