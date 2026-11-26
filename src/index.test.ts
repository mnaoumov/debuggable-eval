import dedent from 'dedent';
import {
  describe,
  expect,
  it
} from 'vitest';

import type { DebuggableEvalOptions } from './index.ts';

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
  return catchErrorWithOptions(code, scriptName);
}

function catchErrorWithOptions(code: string, scriptNameOrOptions: DebuggableEvalOptions | string): Error | null {
  try {
    debuggableEval(code, scriptNameOrOptions);
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
}

function extractColumn(text: string | undefined, scriptName: string): number {
  const escapedName = scriptName.replace(/\./g, '\\.');
  const match = new RegExp(`${escapedName}:\\d+:(?<column>\\d+)`).exec(text ?? '');
  return Number(match?.groups?.['column']);
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

  describe('options form', () => {
    it('accepts the script name in an options object', () => {
      const error = catchErrorWithOptions(CODE_WITH_ERROR, { scriptName: 'optionsScript.js' });
      expect(error?.stack).toContain('optionsScript.js');
    });

    it('generates a script name when the options object has none', () => {
      const EXPECTED_RESULT = 42;
      expect(debuggableEval('42', {})).toBe(EXPECTED_RESULT);
    });

    it('returns the result with offsets', () => {
      const EXPECTED_RESULT = 42;
      expect(debuggableEval('40 + 2', { columnOffset: 3, lineOffset: 5 })).toBe(EXPECTED_RESULT);
    });
  });

  describe('lineOffset', () => {
    it('shifts the runtime error line', () => {
      const LINE_OFFSET = 10;
      const ERROR_LINE = 3;
      const error = catchErrorWithOptions(CODE_WITH_ERROR, { lineOffset: LINE_OFFSET, scriptName: 'lineOffset.js' });
      const match = /lineOffset\.js:(?<line>\d+):/.exec(error?.stack ?? '');
      expect(Number(match?.groups?.['line'])).toBe(ERROR_LINE + LINE_OFFSET);
    });

    it('shifts the syntax error line', () => {
      const LINE_OFFSET = 7;
      const SYNTAX_ERROR_LINE = 3;
      const error = catchErrorWithOptions(CODE_WITH_SYNTAX_ERROR, { lineOffset: LINE_OFFSET, scriptName: 'lineOffset.js' });
      const match = /lineOffset\.js:(?<line>\d+):/.exec(error?.message ?? '');
      expect(Number(match?.groups?.['line'])).toBe(SYNTAX_ERROR_LINE + LINE_OFFSET);
    });

    it('keeps a leading hashbang valid', () => {
      const EXPECTED_RESULT = 42;
      expect(debuggableEval('#!/usr/bin/env node\n42', { lineOffset: 2 })).toBe(EXPECTED_RESULT);
    });
  });

  describe('columnOffset', () => {
    const COLUMN_OFFSET = 20;

    it('shifts the runtime error column on the first line', () => {
      const plain = catchErrorWithOptions('throw new Error(\'first\');', { scriptName: 'columnPlain.js' });
      const shifted = catchErrorWithOptions('throw new Error(\'first\');', { columnOffset: COLUMN_OFFSET, scriptName: 'columnShifted.js' });
      expect(extractColumn(shifted?.stack, 'columnShifted.js')).toBe(extractColumn(plain?.stack, 'columnPlain.js') + COLUMN_OFFSET);
    });

    it('does not shift the runtime error column on later lines', () => {
      const plain = catchErrorWithOptions(CODE_WITH_ERROR, { scriptName: 'columnPlain.js' });
      const shifted = catchErrorWithOptions(CODE_WITH_ERROR, { columnOffset: COLUMN_OFFSET, scriptName: 'columnShifted.js' });
      expect(extractColumn(shifted?.stack, 'columnShifted.js')).toBe(extractColumn(plain?.stack, 'columnPlain.js'));
    });

    it('shifts the syntax error column on the first line', () => {
      const plain = catchErrorWithOptions('let = ;', { scriptName: 'columnPlain.js' });
      const shifted = catchErrorWithOptions('let = ;', { columnOffset: COLUMN_OFFSET, scriptName: 'columnShifted.js' });
      expect(extractColumn(shifted?.message, 'columnShifted.js')).toBe(extractColumn(plain?.message, 'columnPlain.js') + COLUMN_OFFSET);
    });

    it('does not shift the syntax error column on later lines', () => {
      const plain = catchErrorWithOptions(CODE_WITH_SYNTAX_ERROR, { scriptName: 'columnPlain.js' });
      const shifted = catchErrorWithOptions(CODE_WITH_SYNTAX_ERROR, { columnOffset: COLUMN_OFFSET, scriptName: 'columnShifted.js' });
      expect(extractColumn(shifted?.message, 'columnShifted.js')).toBe(extractColumn(plain?.message, 'columnPlain.js'));
    });
  });

  describe('offset validation', () => {
    it.each([
      ['lineOffset', -1],
      ['columnOffset', -1],
      ['lineOffset', 1.5],
      ['columnOffset', Number.NaN]
    ])('rejects %s = %d', (name, value) => {
      const error = catchErrorWithOptions('42', { [name]: value });
      expect(error).toBeInstanceOf(RangeError);
      expect(error?.message).toContain(name);
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
