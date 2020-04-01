const { Article } = require("../../models/index.js");

async function deleteArticle(root, { input }) {
    try {
        const article = await Article.findByIdAndRemove(input.id);

        return {
            article
        };
    } catch (error) {
        return {
            article: null
        };
    }
}

module.exports = deleteArticle;
