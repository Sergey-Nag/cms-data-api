const MatchByOption = require("./MatchByOption");

class MatchByObjectOption {
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
                acc.push(new MatchByOption(option, options[option]));
            } else {
                acc.push(new MatchByObjectOption(option, options[option]));
            }
            return acc;
        }, []);
        return matchers;
    }
}

module.exports = MatchByObjectOption;