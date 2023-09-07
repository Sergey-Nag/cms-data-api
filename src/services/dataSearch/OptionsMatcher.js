const OptionMatcher = require("./OptionMatcher");

module.exports = class OptionsMatcher {
    constructor(optionMatchBy, valuesObj) {
        this.prop = optionMatchBy;
        this.matchers = this.#createMatchers(valuesObj);
    }

    isMatched(item) {
        const obj = this.prop ? item[this.prop] : item;
        return this.matchers.every(m => m.isMatched(obj));
    }

    #createMatchers(options) {
        const matchers = Object.keys(options).reduce((acc, option) => {
            if (typeof options[option] !== 'object') {
                acc.push(new OptionMatcher(option, options[option]));
            } else {
                acc.push(new OptionsMatcher(option, options[option]));
            }
            return acc;
        }, []);
        return matchers;
    }
}