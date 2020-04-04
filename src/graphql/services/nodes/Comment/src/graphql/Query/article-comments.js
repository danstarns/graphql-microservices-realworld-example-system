const { Comment } = require("../../models/index.js");

function articleComments(root, { article }) {
    return Comment.find({ article });
}

module.exports = articleComments;
