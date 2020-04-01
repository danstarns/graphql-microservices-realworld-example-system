const { Article } = require("../../models/index.js");

async function createArticle(root, { input }, { user }) {
    const CreateArticlePayload = { article: null, errors: [] };

    try {
        const article = await Article.create({
            author: user,
            body: input.body,
            description: input.description,
            tagList: input.tagList,
            title: input.title
        });

        return {
            ...CreateArticlePayload,
            article
        };
    } catch ({ message, stack }) {
        return {
            ...CreateArticlePayload,
            errors: [{ message, path: stack }]
        };
    }
}

module.exports = createArticle;
