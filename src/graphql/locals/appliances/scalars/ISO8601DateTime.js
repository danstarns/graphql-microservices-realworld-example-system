const { IdioScalar } = require("idio-graphql");
const { GraphQLScalarType, Kind } = require("graphql");

const GraphQLDateTime = new GraphQLScalarType({
    name: "DateTime",
    description:
        "A date-time string at UTC, such as 2007-12-03T10:15:30Z, " +
        "compliant with the `date-time` format outlined in section 5.6 of " +
        "the RFC 3339 profile of the ISO 8601 standard for representation " +
        "of dates and times using the Gregorian calendar.",
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }

        return new Date(value).toISOString();
    },
    parseValue(value) {
        return new Date(value).toISOString();
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
            throw new TypeError(
                `DateTime cannot represent non string type ${String(
                    ast.value != null ? ast.value : null
                )}`
            );
        }
        const { value } = ast;
        return new Date(value).toISOString();
    }
});

const ISO8601DateTime = new IdioScalar({
    name: "ISO8601DateTime",
    resolver: GraphQLDateTime
});

module.exports = ISO8601DateTime;
