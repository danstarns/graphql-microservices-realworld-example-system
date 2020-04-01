const jwt = require("jsonwebtoken");
const { SECRET } = require("../config.js");

function createJWT(user) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {
                data: { sub: user.id }
            },
            SECRET,
            (err, token) => {
                if (err) {
                    return reject(err);
                }

                return resolve(token);
            }
        );
    });
}

module.exports = createJWT;
