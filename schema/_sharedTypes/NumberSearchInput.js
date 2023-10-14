const { GraphQLScalarType, Kind } = require("graphql");

const NumberSearchInput = new GraphQLScalarType({
    name: 'NumberSearchInput',
    description: 'A String or Int or Float value to filter a range by a number. Provide a string: `< 100`, where first argument describes an operator to second argument that desribes a number. Supports operators: `<`, `<=`, `>`, `>=`, `==` To serch by exact value use `==` operator or provide number',
    serialize(value) {
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            value === null
        ) {
            return value;
        }
        throw new Error('NumberSearchInput cannot represent an invalid value.');
    },
    parseValue(value) {
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
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
            case Kind.INT:
            case Kind.FLOAT:
                return Number(ast.value);
            default:
                throw new Error('NumberSearchInput cannot represent an invalid value.');
        }
    },
});

module.exports = NumberSearchInput;