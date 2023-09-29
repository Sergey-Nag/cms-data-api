const { GraphQLScalarType } = require("graphql");

const NumberSearchInput = new GraphQLScalarType({
    name: 'NumberSearchInput',
    description: 'A String value to filter a range by a number. Provide a string: `< 100`, where first argument describes an operator to second argument that desribes a number. Supports operators: `<`, `<=`, `>`, `>=`, `==`',
    serialize(value) {
        // Ensure the value is a valid type (string, number, boolean, or null)
        if (
            typeof value === 'string' ||
            value === null
        ) {
            return value;
        }
        throw new Error('NumberSearchInput cannot represent an invalid value.');
    },
    parseValue(value) {
        // Ensure the parsed value is a valid type (string, number, boolean, or null)
        if (
            typeof value === 'string' ||
            value === null
        ) {
            return value;
        }
        throw new Error('NumberSearchInput cannot represent an invalid value.');
    },
    parseLiteral(ast) {
        switch (ast.kind) {
            case Kind.STRING:
                return ast.value;
            default:
                throw new Error('NumberSearchInput cannot represent an invalid value.');
        }
    },
});

module.exports = NumberSearchInput;