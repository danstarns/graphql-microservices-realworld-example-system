const gql = require("graphql-tag");
const { Article } = require("../../models/index.js");

async function unfavoriteArticle(
    root,
    { input: { id } },
    { user, injections: { execute } }
) {
    try {
        const article = await Article.findById(id);

        if (!article) {
            throw new Error("Article not found");
        }

        const { errors } = await execute(
            gql`
                mutation($article: ID!) {
                    pullFavoriteArticle(article: $article) {
                        id
                    }
                }
            `,
            {
                variables: {
                    article: article._id.toString()
                },
                context: {
                    user
                }
            }
        );

        if (errors) {
            throw new Error(errors[0].message);
        }

        return {
            article
        };
    } catch (error) {
        return {
            article: null
        };
    }
}

module.exports = unfavoriteArticle;
