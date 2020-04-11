const mongoose = require("mongoose");
const debug = require("./debug.js")("MongoDB: ");
const { MONGODB_URI } = require("./config.js");

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

async function connect() {
    debug(`Connecting '${MONGODB_URI}'`);

    await mongoose.connect(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    debug("Connected");
}

module.exports = { connect };
