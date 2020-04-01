const nodes = require("./nodes/index.js");
const appliances = require("./appliances/index.js");

module.exports = { nodes, ...appliances };
