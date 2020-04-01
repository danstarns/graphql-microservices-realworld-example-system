const bcrypt = require("bcrypt");

const saltRounds = 10;

function hashPassword(plainText) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(plainText, saltRounds, (err, hash) => {
            if (err) {
                return reject(err);
            }

            return resolve(hash);
        });
    });
}

module.exports = hashPassword;
