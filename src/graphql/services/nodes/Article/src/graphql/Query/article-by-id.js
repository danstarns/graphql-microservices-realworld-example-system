const { Article } = require("../../models/index.js");

function articleById(root, { id }) {
    return Article.findById(id);
}

module.exports = articleById;
