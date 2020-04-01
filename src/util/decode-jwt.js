const jwt = require("jsonwebtoken");
const { SECRET } = require("../config.js");

function decodeJWT(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
                return reject(err);
            }

            const {
                data: { sub }
            } = decoded;

            return resolve({ sub });
        });
    });
}

module.exports = decodeJWT;
