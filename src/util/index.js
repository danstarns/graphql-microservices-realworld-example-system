const hashPassword = require("./hash-password.js");
const comparePassword = require("./compare-password.js");
const createJWT = require("./create-jwt.js");
const decodeJWT = require("./decode-jwt.js");

module.exports = {
    hashPassword,
    comparePassword,
    createJWT,
    decodeJWT
};
