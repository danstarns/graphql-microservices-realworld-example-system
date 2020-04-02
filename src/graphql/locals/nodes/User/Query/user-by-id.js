const { User } = require("../../../../../models/index.js");

function userById(root, { id }) {
    return User.findById(id);
}

module.exports = userById;
