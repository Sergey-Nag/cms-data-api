class NumberParser {
    /**
     * Parses the expected value.
     * Expected value is a string or a number. 
     * String value can be in format: `< 100`, where first argument describes an operator to second argument that desribes a number. Supports operators: `<`, `<=`, `>`, `>=`, `==` To serch by exact value use `==` operator or provide number.
     * To specify range use `>= 1 && <= 3` to compine operators.
     * @param {string|number} expectedValue The expected value.
     * @returns {object} The parsed value.
     * @throws {Error} If the expected value is not a string or a number.
     * @throws {Error} If the expected value is a string and has invalid format.
     * @throws {Error} If the expected value is a string and has invalid numeric value.
     * 
    */
    static parse(expectedValue) {
        if (typeof expectedValue === "number") {
            return { operator: null };
        }
        
        if (typeof expectedValue !== "string") {
            throw new Error("Expected value must be a string or a number.");
        }

        const andRange = expectedValue.trim().split("&&");

        if (andRange.length > 1) {
            return {
                operator: "&&",
                value: andRange.map(item => NumberParser.parse(item)),
            }
        }

        const parts = expectedValue.trim().split(" ");
        if (parts.length !== 2) {
            throw new Error("Invalid expected value format.");
        }

        const operator = parts[0];
        const value = parseFloat(parts[1]);

        if (isNaN(value)) {
            throw new Error("Invalid numeric value in the expected value.");
        }

        return { operator, value };
    }
}

module.exports = NumberParser