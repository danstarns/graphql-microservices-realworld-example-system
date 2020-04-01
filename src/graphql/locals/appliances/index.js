const path = require("path");
const scalars = require("./scalars/index.js");
const directives = require("./directives/index.js");

module.exports = {
    scalars,
    directives,
    schemaGlobals: path.join(__dirname, "./schema-globals.gql")
};
