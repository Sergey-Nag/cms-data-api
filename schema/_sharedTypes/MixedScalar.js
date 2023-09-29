const { GraphQLScalarType } = require("graphql");

const MixedScalar = new GraphQLScalarType({
    name: 'MixedScalar',
    description: 'Represents a value that can be a `String`, `Float`, `Int`, or `Boolean`.',
    serialize(value) {
        // Ensure the value is a valid type (string, number, boolean, or null)
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null
        ) {
            return value;
        }
        throw new Error('MixedScalar cannot represent an invalid value.');
    },
    parseValue(value) {
        // Ensure the parsed value is a valid type (string, number, boolean, or null)
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null
        ) {
            return value;
        }
        throw new Error('MixedScalar cannot represent an invalid value.');
    },
    parseLiteral(ast) {
        switch (ast.kind) {
            case Kind.STRING:
            case Kind.INT:
            case Kind.FLOAT:
            case Kind.BOOLEAN:
                return ast.value;
            default:
                throw new Error('MixedScalar cannot represent an invalid value.');
        }
    },
});

module.exports = MixedScalar;