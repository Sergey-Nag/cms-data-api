class Matcher {
    constructor(propertyName, expectedValue) {
        this.propertyName = propertyName;
        this.expectedValue = expectedValue;
    }

    isMatched(item) {
        return this.getItemValue(item) === this.expectedValue;
    }

    getItemValue(item) {
        let itemValue = item[this.propertyName];
        if (typeof itemValue === 'function') {
            itemValue = itemValue.call(item);
        }

        return itemValue;
    }
}

module.exports = Matcher;