const graphql = require("./graphql/index.js");
const mongodb = require("./mongodb.js");
const debug = require("./debug.js")("App: ");

async function main() {
    debug("Starting");

    try {
        await mongodb.connect();

        await graphql.start();
    } catch (error) {
        console.error(error);

        process.exit(1);
    }

    debug("Started");
}

main();
