const MatchByExternalOption = require("./MatchByExternalOption");
const MatchByOption = require("./MatchByOption");
const externalMatchProperties = require("./externalMatchProperties");

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
            if (typeof options[option] === 'object' && options[option] !== null) {

                acc.push(new MatchByObjectOption(option, options[option]));

            } else if (externalMatchProperties.has(option)) {

                acc.push(new MatchByExternalOption(option, options[option]));

            } else {

                acc.push(new MatchByOption(option, options[option]));

            }
            return acc;
        }, []);
        return matchers;
    }
}

module.exports = MatchByObjectOption;