import debuggableEval from '../index';

const codeWithError = `console.log('Line 1');
console.log('Line 2');
throw new Error('Error in Line 3');
console.log('Line 4');`;

const codeWithSyntaxError = `console.log('Line 1');
function missingClosingBrace() {
console.log('Line 3');`;

function catchError(code: string, scriptName: string): Error | null {
  try {
    debuggableEval(code, scriptName);
    return null;
  } catch (e: unknown) {
    return e as Error;
  }
}

describe('debuggableEval', () => {
  describe('errors', () => {
    it('rethrown', () => {
      const error = catchError(codeWithError, 'testScript.js');
      expect(error).not.toBeNull();
    });

    it('stack contains script name', () => {
      const error = catchError(codeWithError, 'testScript.js') as Error;
      expect(error.stack).toContain('testScript.js');
    });

    it('stack contains proper error line number', () => {
      const error = catchError(codeWithError, 'testScript.js') as Error;
      const match = (error.stack as string).match(/testScript\.js:(\d+):/) as RegExpMatchArray;
      expect(Number(match[1])).toBe(3);
    });

    it('stack contains proper error column number', () => {
      const error = catchError(codeWithError, 'testScript.js') as Error;
      const match = (error.stack as string).match(/testScript\.js:\d+:(\d+)\)/) as RegExpMatchArray;
      expect(Number(match[1])).toBe(7);
    });
  });

  describe('syntax errors', () => {
    it('thrown when the code is invalid', () => {
      const error = catchError(codeWithSyntaxError, 'testScript.js') as Error;
      expect(error).toBeInstanceOf(SyntaxError);
    });

    it('message contains script name', () => {
      const error = catchError(codeWithSyntaxError, 'testScript.js') as Error;
      expect(error.message).toContain('testScript.js');
    });

    it('message contains proper line number', () => {
      const error = catchError(codeWithSyntaxError, 'testScript.js') as Error;
      const match = error.message.match(/testScript\.js:(\d+):/) as RegExpMatchArray;
      expect(Number(match[1])).toBe(3);
    });

    it('message contains proper column number', () => {
      const error = catchError(codeWithSyntaxError, 'testScript.js') as Error;
      const match = error.message.match(/testScript\.js:\d+:(\d+)\n/) as RegExpMatchArray;
      expect(Number(match[1])).toBe(23);
    });
  });
});
