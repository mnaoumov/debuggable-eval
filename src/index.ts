import syntaxErrorCheck from 'syntax-error';
import { Buffer } from 'buffer';

function debuggableEval(code: string, scriptName = 'dynamicScript.js'): unknown {
  const syntaxError = syntaxErrorCheck(code);
  if (syntaxError) {
    throw new SyntaxError(
      `${scriptName}:${syntaxError.line}:${syntaxError.column}\nParseError: ${syntaxError.message}`,
    );
  }

  const base64 = Buffer.from(code).toString('base64');
  const wrappedCode = `${code}\n//# sourceURL=${scriptName}\n//# sourceMappingURL=data:application/json;base64,${base64}`;
  return eval(wrappedCode);
}

export default debuggableEval;
