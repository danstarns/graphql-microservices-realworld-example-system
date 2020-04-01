const bcrypt = require("bcrypt");

function comparePassword(plainText, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainText, hash, (err, result) => {
            if (err) {
                return reject(err);
            }

            return resolve(result);
        });
    });
}

module.exports = comparePassword;
