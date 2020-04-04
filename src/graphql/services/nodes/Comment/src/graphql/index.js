const { GraphQLNode } = require("idio-graphql");
const path = require("path");
const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Fields = require("./Fields/index.js");
const debug = require("../debug.js")("GraphQL-Comment: ");
const { NATS_URL } = require("../config.js");

const Comment = new GraphQLNode({
    name: "Comment",
    typeDefs: path.join(__dirname, "./Comment.gql"),
    resolvers: {
        Query,
        Mutation,
        Fields
    }
});

async function start() {
    debug("Starting");

    await Comment.serve({ gateway: "conduit_gateway", transporter: NATS_URL });

    debug("Started");
}

module.exports = { start };
