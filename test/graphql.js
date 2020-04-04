const { createTestClient } = require("apollo-server-testing");
const { GraphQLGateway } = require("idio-graphql");
const { ApolloServer } = require("apollo-server-express");
const fs = require("fs");

const path = require("path");
const { NATS_URL } = require("../src/config.js");

async function testClient({ user } = {}) {
    const locals = require("../src/graphql/locals/index.js");

    console.log(await fs.promises.readdir(path.dirname(locals.schemaGlobals)));
    console.log(await fs.promises.readFile(locals.schemaGlobals));
    console.log(JSON.stringify(locals, null, 2));
    const gateway = new GraphQLGateway(
        {
            locals,
            services: {
                nodes: ["Comment", "Article"]
            }
        },
        { nodeID: "conduit_gateway", transporter: NATS_URL }
    );

    const { schema } = await gateway.start();

    const server = new ApolloServer({
        schema,
        context: () => ({ user })
    });

    const client = createTestClient(server);

    return client;
}

module.exports = testClient;
