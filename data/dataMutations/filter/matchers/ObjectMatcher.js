const { NUMBER_SERACH_INPUT_REGEXP } = require("../../../../constants/regexp");
const Matcher = require("./Matcher");
const NumberMatcher = require("./NumberMatcher");
const StringMatcher = require("./StringMatcher");

class MatcherFactory {
    static createMatcher(propertyName, expectedValue, isPartialy) {
        if (this.isNumericValue(expectedValue)) {
            return new NumberMatcher(propertyName, expectedValue);
        } else if (typeof expectedValue === "string") {
            return new StringMatcher(propertyName, expectedValue, isPartialy);
        } else if (typeof expectedValue === "object" && !Array.isArray(expectedValue) && expectedValue !== null) {
            return new ObjectMatcher(propertyName, expectedValue, isPartialy);
        } else if (Array.isArray(expectedValue)) {
            return new ArrayMatcher(propertyName, expectedValue, isPartialy);
        }
        return new Matcher(propertyName, expectedValue);
    }
    
    static isNumericValue(expectedValue) {
        return typeof expectedValue === "number" ||
            typeof expectedValue === 'string' && NUMBER_SERACH_INPUT_REGEXP.test(expectedValue);
    }
}

class ObjectMatcher extends Matcher {
    constructor(key, data, isPartialy = false) {
        super(key, data);
        this.isPartialy = isPartialy;
        this.matchers = this.createMatchers(this.expectedValue, isPartialy);
    }

    createMatchers(data, isPartialy) {
        return Object.entries(data).map(([key, value]) => {
            return MatcherFactory.createMatcher(key, value, isPartialy);
        });
    }

    isMatched(item) {
        const itemObject = this.propertyName ? item[this.propertyName] : item;
        return this.matchers.every((matcher) => {
            if (matcher.propertyName in itemObject) {
                return matcher.isMatched(itemObject);
            }
            return false;
        });
    }
}

class ArrayMatcher extends ObjectMatcher {
    constructor(propertyName, expectedValue, isPartialy = false) {
        super(propertyName, expectedValue, isPartialy);
    }

    createMatchers(data, isPartialy) {
        return data.map((value) => {
            return MatcherFactory.createMatcher(null, value, false);
        });
    }
    
    isMatched(item) {
        const itemArray = this.propertyName ? item[this.propertyName] : item;
        
        const compare = (matcher) => {
            if (matcher.expectedValue[0] === '*') {
                return itemArray && itemArray.length > 0;
            }

            return itemArray && itemArray.some(item => matcher.isMatched(item));
        }

        return this.isPartialy
            ? this.matchers.some(compare)
            : this.matchers.every(compare);
    }
}

module.exports = ObjectMatcher;