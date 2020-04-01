const { Article } = require("../../models/index.js");

function tags() {
    return Article.distinct("tagList");
}

module.exports = tags;
