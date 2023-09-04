function isKebabCase(str) {
    const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    
    return kebabCasePattern.test(str);
}

module.exports = isKebabCase;
