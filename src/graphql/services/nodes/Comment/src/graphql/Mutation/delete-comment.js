const { Comment } = require("../../models/index.js");

async function deleteComment(root, { input }) {
    try {
        const comment = await Comment.findByIdAndRemove(input.id);

        return {
            comment
        };
    } catch (error) {
        return {
            comment: null
        };
    }
}

module.exports = deleteComment;
