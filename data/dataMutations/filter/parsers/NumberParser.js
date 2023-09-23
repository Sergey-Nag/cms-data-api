class NumberParser {
    static parse(expectedValue) {
        if (typeof expectedValue === "number") {
            return { operator: null };
        }
        
        if (typeof expectedValue !== "string") {
            throw new Error("Expected value must be a string or a number.");
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