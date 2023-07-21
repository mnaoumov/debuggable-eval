import syntaxErrorCheck from 'syntax-error';

function debuggableEval(code: string, scriptName: string = 'dynamicScript.js'): unknown {
    const syntaxError = syntaxErrorCheck(code);
    if (syntaxError) {
        throw new SyntaxError(`${scriptName}:${syntaxError.line}:${syntaxError.column}\nParseError: ${syntaxError.message}`);
    }

    const wrappedCode = `${code}
//# sourceURL=${scriptName}
//# sourceMappingURL=data:application/json;base64,${btoa(code)}`;
    return eval(wrappedCode);
}

export default debuggableEval;
