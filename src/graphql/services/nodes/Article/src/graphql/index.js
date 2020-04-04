const { GraphQLNode } = require("idio-graphql");
const path = require("path");
const { NATS_URL, NODE_ENV } = require("../config.js");
const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Fields = require("./Fields/index.js");
const Types = require("./Types/index.js");
const debug = require("../debug.js")("GraphQL-Article: ");

const Article = new GraphQLNode({
    name: "Article",
    typeDefs: path.join(__dirname, "./Article.gql"),
    resolvers: {
        Query,
        Mutation,
        Fields
    },
    types: Types
});

async function start() {
    debug("Starting");

    await Article.serve({
        gateway: "conduit_gateway",
        transporter: NATS_URL,
        logLevel: NODE_ENV === "test" ? "error" : "info"
    });

    debug("Started");
}

module.exports = { start };
