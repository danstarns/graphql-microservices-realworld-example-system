/* eslint-disable no-async-promise-executor */
const { GraphQLGateway } = require("idio-graphql");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { express: voyagerMiddleware } = require("graphql-voyager/middleware");
const bodyParser = require("body-parser");
const cors = require("cors");
const locals = require("./graphql/locals/index.js");
const debug = require("./debug.js")("GraphQL: ");
const { NATS_URL, PORT, NODE_ENV } = require("./config.js");
const { decodeJWT } = require("./util/index.js");

const gateway = new GraphQLGateway(
    {
        locals,
        services: { nodes: ["Article", "Comment"] }
    },
    {
        nodeID: "conduit_gateway",
        transporter: NATS_URL,
        logLevel: NODE_ENV === "test" ? "error" : "info"
    }
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function start() {
    return new Promise(async (resolve, reject) => {
        debug(`Starting Server`);

        const { schema } = await gateway.start();

        const server = new ApolloServer({
            schema,
            playground: NODE_ENV === "develop",
            context: async ({ req, res }) => {
                const authorization = req.header("authorization");

                if (!authorization) {
                    return { user: null, req, res };
                }

                const [, jwt] = authorization.split("Token ");

                const { sub } = await decodeJWT(jwt);

                return {
                    req,
                    res,
                    user: sub
                };
            }
        });

        server.applyMiddleware({ app });

        if (NODE_ENV === "develop") {
            app.use("/voyager", voyagerMiddleware({ endpointUrl: "/graphql" }));

            debug(`Started Playground @ http://localhost:${PORT}/graphql`);
            debug(`Started Voyager @ http://localhost:${PORT}/voyager`);
        }

        app.listen(PORT, (err) => {
            if (err) {
                return reject(err);
            }

            debug(`Started @ http://localhost:${PORT}/graphql`);

            return resolve();
        });
    });
}

module.exports = { start };
