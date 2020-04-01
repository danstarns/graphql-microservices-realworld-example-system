const { Comment } = require("../../models/index.js");

async function addComment(root, { input }, { user }) {
    const { articleId, body } = input;

    const AddCommentPayload = { comment: null, errors: [] };

    try {
        const comment = await Comment.create({
            article: articleId,
            author: user,
            body
        });

        return {
            ...AddCommentPayload,
            comment
        };
    } catch ({ message, stack }) {
        return { ...AddCommentPayload, errors: [{ message, path: stack }] };
    }
}

module.exports = addComment;
