const gql = require("graphql-tag");

async function comments({ id }, args, { injections: { execute } }) {
    const { data, errors } = await execute(
        gql`
            query($article: ID!) {
                comments: articleComments(article: $article) {
                    id
                    body
                    createdAt
                    updatedAt
                }
            }
        `,
        {
            variables: {
                article: id.toString()
            }
        }
    );

    if (errors && errors.length) {
        throw new Error(errors[0].message);
    }

    return data.comments;
}

module.exports = comments;
