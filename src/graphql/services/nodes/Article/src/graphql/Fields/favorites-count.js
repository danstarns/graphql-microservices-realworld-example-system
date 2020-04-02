const gql = require("graphql-tag");

async function favoritesCount({ id }, args, { injections: { execute } }) {
    const { data, errors } = await execute(
        gql`
            query($article: ID!) {
                articleUserFavoriteCount(article: $article)
            }
        `,
        {
            variables: {
                article: id
            }
        }
    );

    if (errors && errors.length) {
        throw new Error(errors[0].message);
    }

    return data.articleUserFavoriteCount;
}

module.exports = favoritesCount;
