/**
 * @packageDocumentation
 *
 * Makes `eval()` debugger-friendly with ability to set breakpoints and see proper line numbers in Error stack traces.
 */

const HASH_RADIX = 36;
const HASH_SHIFT = 5;
const SOURCE_URL_PATTERN = /\/\/#\s*sourceURL\s*=/;

/**
 * Checks the given code for syntax errors.
 *
 * Uses `vm.Script` (Node.js) for rich error messages with line/column info,
 * falling back to `new Function()` in non-Node environments.
 *
 * @param code - The code to check.
 * @param scriptName - The script name to include in error messages.
 * @throws SyntaxError if the code contains syntax errors, with script name and location info.
 */
function checkSyntax(code: string, scriptName: string): void {
  try {
    checkSyntaxWithVmScript(code, scriptName);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const location = extractLocationFromStack(error, scriptName);
      const prefix = location ? `${scriptName}:${location}` : scriptName;
      throw new SyntaxError(`${prefix}: ${error.message}`, { cause: error });
    }
    throw error;
  }
}

/**
 * Attempts syntax checking via Node.js `vm.Script` for rich line/column errors,
 * falling back to `new Function()` in non-Node environments.
 *
 * @param code - The code to check.
 * @param scriptName - The filename to associate with the script.
 * @throws SyntaxError with location info if the code has syntax errors.
 */
function checkSyntaxWithVmScript(code: string, scriptName: string): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, import-x/no-nodejs-modules -- Dynamic require to gracefully degrade in non-Node environments where vm is unavailable.
  const vm = require('vm') as typeof import('vm') | undefined;
  if (vm?.Script) {
    new vm.Script(code, { filename: scriptName });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func -- Intentional: used solely for syntax validation, not execution.
  new Function(code);
}

/**
 * Evaluates JavaScript code with debugger-friendly source mapping.
 *
 * Appends a `//# sourceURL` pragma so that debuggers and Error stack traces
 * show meaningful script names and line numbers instead of anonymous eval references.
 *
 * @param code - The JavaScript code string to evaluate.
 * @param scriptName - An optional name for the script. If omitted, a hash-based name is generated.
 * @returns The result of evaluating the code.
 */
function debuggableEval(code: string, scriptName?: string): unknown {
  scriptName ??= `debuggable-eval:${simpleHash(code).toString(HASH_RADIX)}`;

  checkSyntax(code, scriptName);

  const sanitizedCode = code.replace(SOURCE_URL_PATTERN, '// (overridden sourceURL)=');
  const wrappedCode = `${sanitizedCode}\n//# sourceURL=${encodeURI(scriptName.replace(/\\/g, '/'))}`;
  return globalThis.eval(wrappedCode);
}

/**
 * Extracts line and column location from a SyntaxError's stack trace.
 *
 * V8's `vm.Script` errors include a line like `filename:line` at the top of the stack.
 * This function parses that to return a `"line:column"` or `"line"` string.
 *
 * @param error - The SyntaxError to extract location from.
 * @param scriptName - The script name to look for in the stack.
 * @returns A location string like `"3"` or `"3:10"`, or `null` if not found.
 */
function extractLocationFromStack(error: SyntaxError, scriptName: string): null | string {
  const stack = error.stack ?? '';
  const escapedName = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const locationPattern = new RegExp(`${escapedName}:(?<line>\\d+)(?::(?<column>\\d+))?`);
  const match = locationPattern.exec(stack);
  if (!match?.groups?.['line']) {
    return null;
  }
  const column = match.groups['column'];
  if (column) {
    return `${match.groups['line']}:${column}`;
  }
  return match.groups['line'];
}

/**
 * Computes a simple non-cryptographic hash of a string.
 *
 * Uses the djb2 algorithm. Returns an unsigned 32-bit integer to avoid negative values.
 *
 * @param str - The string to hash.
 * @returns A non-negative integer hash.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise -- Bitwise operations are essential for hash computation.
    hash = (hash << HASH_SHIFT) - hash + char;
    // eslint-disable-next-line no-bitwise -- Truncate to 32-bit integer.
    hash |= 0;
  }
  // eslint-disable-next-line no-bitwise -- Unsigned right shift to get non-negative 32-bit integer.
  return hash >>> 0;
}

export { debuggableEval };
