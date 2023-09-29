class Matcher {
    constructor(propertyName, expectedValue) {
        this.propertyName = propertyName;
        this.expectedValue = expectedValue;
    }

    isMatched(item) {
        return this.getItemValue(item) === this.expectedValue;
    }

    getItemValue(item) {
        let itemValue = this.propertyName ? item[this.propertyName] : item;
        if (typeof itemValue === 'function') {
            itemValue = itemValue.call(item);
        }
        return itemValue;
    }
}

module.exports = Matcher;