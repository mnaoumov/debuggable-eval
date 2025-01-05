import syntaxErrorCheck from 'syntax-error';

function debuggableEval(code: string, scriptName?: string): unknown {
  if (!scriptName) {
    scriptName = `debuggable-eval:${simpleHash(code).toString()}`;
  }

  const syntaxError = syntaxErrorCheck(code);
  if (syntaxError) {
    throw new SyntaxError(
      `${scriptName}:${syntaxError.line.toString()}:${syntaxError.column.toString()}\nParseError: ${syntaxError.message}`
    );
  }

  const wrappedCode = `${code}\n//# sourceURL=${encodeURI(scriptName)}`;
  return globalThis.eval(wrappedCode);
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
