const debug = require("debug");

const prefix = "@Conduit-Gateway-Service: ";

/**
 * @param {string} namespace
 *
 * @returns {import('debug').Debug}
 */
function createComponent(namespace) {
    return debug(`${prefix}${namespace}`);
}

module.exports = createComponent;
