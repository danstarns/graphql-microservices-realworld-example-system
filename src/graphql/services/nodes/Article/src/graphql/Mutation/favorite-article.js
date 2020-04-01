const { Article, User } = require("../../../../models/index.js");

async function favoriteArticle(root, { input: { id } }, { user }) {
    try {
        const article = await Article.findById(id);

        if (!article) {
            throw new Error("Article not found");
        }

        await User.findByIdAndUpdate(user, {
            $addToSet: { "favorites.articles": article.id }
        });

        return {
            article
        };
    } catch (error) {
        return {
            article: null
        };
    }
}

module.exports = favoriteArticle;
