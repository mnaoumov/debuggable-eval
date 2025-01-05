import syntaxErrorCheck from 'syntax-error';

function debuggableEval(code: string, scriptName?: string): unknown {
  const syntaxError = syntaxErrorCheck(code);
  if (syntaxError) {
    throw new SyntaxError(
      `${scriptName}:${syntaxError.line}:${syntaxError.column}\nParseError: ${syntaxError.message}`,
    );
  }

  if (!scriptName) {
    scriptName = `debuggable-eval:${simpleHash(code)}`;
  }

  const wrappedCode = `${code}\n//# sourceURL=${scriptName}`;
  return eval(wrappedCode);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export { debuggableEval };
