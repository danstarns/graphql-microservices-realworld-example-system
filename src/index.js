const debug = require("./debug.js")("App: ");
const mongodb = require("./mongodb.js");
const server = require("./server.js");

async function main() {
    debug("Starting");

    try {
        await mongodb.connect();

        await server.start();
    } catch (error) {
        console.error(error);

        process.exit(1);
    }

    debug("Started");
}

main();
