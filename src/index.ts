/**
 * @packageDocumentation
 *
 * Makes `eval()` debugger-friendly with ability to set breakpoints and see proper line numbers in Error stack traces.
 */

import type { Position } from 'acorn';

import { parse } from 'acorn';

/**
 * Options for {@link debuggableEval}.
 *
 * The `lineOffset` and `columnOffset` options follow the design of the options with the same names in
 * Node's `node:vm` `runInThisContext()` and `Script`.
 */
export interface DebuggableEvalOptions {
  /**
   * How many columns the first line of the code is shifted to the right in the document it came from.
   *
   * Stack traces, breakpoints and syntax errors on the first line report columns shifted by this amount.
   * Later lines are not affected, as in `node:vm`.
   *
   * Must be a non-negative integer: a `//# sourceURL` pragma cannot express a negative offset,
   * so a negative value throws a `RangeError`.
   *
   * @default 0
   */
  readonly columnOffset?: number;

  /**
   * How many lines above the code there are in the document it came from,
   * such as the lines before a fenced code block in a note.
   *
   * Stack traces, breakpoints and syntax errors report lines shifted by this amount.
   *
   * Must be a non-negative integer: a `//# sourceURL` pragma cannot express a negative offset,
   * so a negative value throws a `RangeError`.
   *
   * @default 0
   */
  readonly lineOffset?: number;

  /**
   * A name for the script. If omitted, a hash-based name is generated.
   */
  readonly scriptName?: string;
}

interface AcornSyntaxError extends SyntaxError {
  loc?: Position;
}

interface Offsets {
  columnOffset: number;
  lineOffset: number;
}

const ECMA_VERSION = 2024;
const HASH_RADIX = 36;
const HASH_SHIFT = 5;
const HASHBANG_PATTERN = /^#!/;
const SOURCE_URL_PATTERN = /\/\/#\s*sourceURL\s*=/;

/**
 * Evaluates JavaScript code with debugger-friendly source mapping.
 *
 * Appends a `//# sourceURL` pragma so that debuggers and Error stack traces
 * show meaningful script names and line numbers instead of anonymous eval references.
 *
 * @param code - The JavaScript code string to evaluate.
 * @param scriptNameOrOptions - An optional name for the script, or {@link DebuggableEvalOptions}.
 * If no name is given, a hash-based name is generated.
 * @returns The result of evaluating the code.
 * @throws RangeError if `lineOffset` or `columnOffset` is negative or not an integer.
 * A `//# sourceURL` pragma can only shift the code down and right, so a negative offset cannot be expressed.
 */
export function debuggableEval(code: string, scriptNameOrOptions?: DebuggableEvalOptions | string): unknown {
  const options: DebuggableEvalOptions = typeof scriptNameOrOptions === 'string' ? { scriptName: scriptNameOrOptions } : scriptNameOrOptions ?? {};
  const offsets: Offsets = {
    columnOffset: validateOffset(options.columnOffset, 'columnOffset'),
    lineOffset: validateOffset(options.lineOffset, 'lineOffset')
  };
  const scriptName = options.scriptName ?? `debuggable-eval:${simpleHash(code).toString(HASH_RADIX)}`;

  checkSyntax(code, scriptName, offsets);

  const sanitizedCode = code.replace(SOURCE_URL_PATTERN, '// (overridden sourceURL)=');
  const shiftedCode = shiftCode(sanitizedCode, offsets);
  const wrappedCode = `${shiftedCode}\n//# sourceURL=${encodeURI(scriptName.replace(/\\/g, '/'))}`;
  return globalThis.eval(wrappedCode);
}

/**
 * Checks the given code for syntax errors using acorn parser.
 *
 * Provides line and column numbers in error messages regardless of the runtime environment.
 *
 * @param code - The code to check.
 * @param scriptName - The script name to include in error messages.
 * @param offsets - The line and column offsets to apply to the reported location.
 * @throws SyntaxError if the code contains syntax errors, with script name, line, and column info.
 */
function checkSyntax(code: string, scriptName: string, offsets: Offsets): void {
  try {
    parse(code, {
      allowAwaitOutsideFunction: true,
      allowHashBang: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      ecmaVersion: ECMA_VERSION,
      sourceType: 'module'
    });
    /* v8 ignore start -- acorn only throws SyntaxError with loc; defensive catch for unexpected errors or missing loc. */
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const location = extractAcornLocation(error, offsets);
      const prefix = location ? `${scriptName}:${location}` : scriptName;
      throw new SyntaxError(`${prefix}: ${error.message}`, { cause: error });
    }
    throw error;
  }
  /* v8 ignore stop */
}

/**
 * Extracts line and column location from an acorn SyntaxError.
 *
 * Acorn attaches a `loc` property with `{ line, column }` to its SyntaxErrors.
 *
 * @param error - The SyntaxError thrown by acorn.
 * @param offsets - The line and column offsets to apply. The column offset applies to the first line only.
 * @returns A location string like `"3:10"`, or `null` if no location is available.
 */
/* v8 ignore start -- acorn always attaches loc to SyntaxErrors; defensive null check for the branch. */
function extractAcornLocation(error: SyntaxError, offsets: Offsets): null | string {
  const loc = (error as AcornSyntaxError).loc;
  if (!loc) {
    return null;
  }
  const column = loc.line === 1 ? loc.column + offsets.columnOffset : loc.column;
  return `${String(loc.line + offsets.lineOffset)}:${String(column)}`;
}
/* v8 ignore stop */

/**
 * Shifts the code down by `lineOffset` lines and its first line right by `columnOffset` columns.
 *
 * A leading hashbang is only valid at the very start of the code, so it is turned into a line comment of the same length first.
 *
 * @param code - The code to shift.
 * @param offsets - The line and column offsets.
 * @returns The shifted code.
 */
function shiftCode(code: string, offsets: Offsets): string {
  if (offsets.lineOffset === 0 && offsets.columnOffset === 0) {
    return code;
  }
  const codeWithoutHashbang = code.replace(HASHBANG_PATTERN, '//');
  return `${'\n'.repeat(offsets.lineOffset)}${' '.repeat(offsets.columnOffset)}${codeWithoutHashbang}`;
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

/**
 * Validates a line or column offset.
 *
 * @param value - The offset, or `undefined` for the default of `0`.
 * @param name - The option name to include in the error message.
 * @returns The offset.
 * @throws RangeError if the offset is negative or not an integer.
 */
function validateOffset(value: number | undefined, name: string): number {
  if (value === undefined) {
    return 0;
  }
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(
      `debuggableEval: ${name} must be a non-negative integer, got ${String(value)}. A //# sourceURL pragma cannot express a negative offset.`
    );
  }
  return value;
}
