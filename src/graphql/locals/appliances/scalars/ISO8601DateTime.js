const { IdioScalar } = require("idio-graphql");
const { GraphQLDateTime } = require("graphql-iso-date");

const ISO8601DateTime = new IdioScalar({
    name: "ISO8601DateTime",
    resolver: GraphQLDateTime
});

module.exports = ISO8601DateTime;
