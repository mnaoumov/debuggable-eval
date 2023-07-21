
function debuggableEval(code: string, scriptName: string = 'dynamicScript.js'): unknown {
    const wrappedCode = `${code}
//# sourceURL=${scriptName}
//# sourceMappingURL=data:application/json;base64,${btoa(code)}`;
    return eval(wrappedCode);
}

export default debuggableEval;
