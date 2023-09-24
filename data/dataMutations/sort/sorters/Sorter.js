const { isNil } = require("lodash");
const { ISO_DATE_REGEXP } = require("../../../../constants/regexp");

class CompareFactory {
    static isNumbers(a, b) {
        return typeof a === 'number' && typeof b === 'number'
    }
    static isStrings(a, b) {
        return typeof a === 'string' && typeof b === 'string';
    }
    static isISODate(a, b) {
        return ISO_DATE_REGEXP.test(a) && ISO_DATE_REGEXP.test(b);
    }
    static isBooleans(a, b) {
        return typeof a === 'boolean' && typeof b === 'boolean';
    }

    static numbers(a, b) {
        return a - b
    }
    static strings(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }
    static booleans(a, b) {
        return a === b ? 0 : a ? -1 : 1;
    }
    static dates(a, b) {
        const dateA = new Date(a);
        const dateB = new Date(b);

        return dateA > dateB 
            ? 1 
            : dateA < dateB 
                ? -1 
                : 0;
    }
}

class Sorter {
    constructor() {
    }

    compare(a, b) {
        if (isNil(a) || isNil(b)) return undefined;

        if (CompareFactory.isNumbers(a, b)) {
            return CompareFactory.numbers(a, b);
        } else if (CompareFactory.isStrings(a, b)) {
            if (CompareFactory.isISODate(a, b)) {
                return CompareFactory.dates(a, b);
            }
            return CompareFactory.strings(a, b);
        } else if (CompareFactory.isBooleans(a, b)) {
            return CompareFactory.booleans(a, b)
        } else {
            throw new Error(`Unsupported data type for comparison. a: ${typeof a}, b: ${typeof b}`);
        }
    }
}

module.exports = Sorter;