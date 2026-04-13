/**
 * @packageDocumentation
 *
 * Makes `eval()` debugger-friendly with ability to set breakpoints and see proper line numbers in Error stack traces.
 */

import type { Position } from 'acorn';

import { parse } from 'acorn';

const ECMA_VERSION = 2024;
const HASH_RADIX = 36;
const HASH_SHIFT = 5;
const SOURCE_URL_PATTERN = /\/\/#\s*sourceURL\s*=/;

/**
 * Checks the given code for syntax errors using acorn parser.
 *
 * Provides line and column numbers in error messages regardless of the runtime environment.
 *
 * @param code - The code to check.
 * @param scriptName - The script name to include in error messages.
 * @throws SyntaxError if the code contains syntax errors, with script name, line, and column info.
 */
function checkSyntax(code: string, scriptName: string): void {
  try {
    parse(code, {
      allowAwaitOutsideFunction: true,
      allowHashBang: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      ecmaVersion: ECMA_VERSION,
      sourceType: 'module'
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const location = extractAcornLocation(error);
      const prefix = location ? `${scriptName}:${location}` : scriptName;
      throw new SyntaxError(`${prefix}: ${error.message}`, { cause: error });
    }
    throw error;
  }
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
 * Extracts line and column location from an acorn SyntaxError.
 *
 * Acorn attaches a `loc` property with `{ line, column }` to its SyntaxErrors.
 *
 * @param error - The SyntaxError thrown by acorn.
 * @returns A location string like `"3:10"`, or `null` if no location is available.
 */
function extractAcornLocation(error: SyntaxError): null | string {
  const loc = (error as { loc?: Position }).loc;
  if (!loc) {
    return null;
  }
  return `${String(loc.line)}:${String(loc.column)}`;
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
