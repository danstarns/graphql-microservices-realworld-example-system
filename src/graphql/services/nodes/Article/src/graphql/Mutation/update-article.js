const { Article } = require("../../models/index.js");

async function updateArticle(root, { input }) {
    const UpdateArticlePayload = { article: null, errors: [] };

    const { id, ...updates } = input;

    try {
        const article = await Article.findByIdAndUpdate(
            id,
            { $set: updates },
            {
                new: true
            }
        );

        return {
            ...UpdateArticlePayload,
            article
        };
    } catch (error) {
        return {
            article: null
        };
    }
}

module.exports = updateArticle;
