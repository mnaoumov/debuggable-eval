import syntaxErrorCheck from 'syntax-error';

function debuggableEval(code: string, scriptName = 'dynamicScript.js'): unknown {
  const syntaxError = syntaxErrorCheck(code);
  if (syntaxError) {
    throw new SyntaxError(
      `${scriptName}:${syntaxError.line}:${syntaxError.column}\nParseError: ${syntaxError.message}`,
    );
  }

  const wrappedCode = `${code}\n//# sourceURL=${scriptName}`;
  return eval(wrappedCode);
}

export default debuggableEval;
