const { createTestClient } = require("apollo-server-testing");
const { GraphQLGateway } = require("idio-graphql");
const { ApolloServer } = require("apollo-server-express");
const locals = require("../src/graphql/locals/index.js");

const { NATS_URL } = require("../src/config.js");

const gateway = new GraphQLGateway(
    {
        locals,
        services: {
            nodes: ["Comment", "Article"]
        }
    },
    { nodeID: "conduit_gateway", transporter: NATS_URL, logLevel: "error" }
);

let started;
let typeDefs;
let resolvers;
let schemaDirectives;

async function testClient({ user } = {}) {
    if (!started) {
        ({ typeDefs, resolvers, schemaDirectives } = await gateway.start());
    }

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        schemaDirectives,
        context: () => ({ user })
    });

    const client = createTestClient(server);

    return client;
}

module.exports = testClient;
