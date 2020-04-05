const gql = require("graphql-tag");

async function article(root, args, { injections: { execute } }) {
    const { data, errors } = await execute(
        gql`
            query($id: ID!) {
                articleById(id: $id) {
                    id
                    body
                    description
                    slug
                    title
                    tagList
                    updatedAt
                    createdAt
                }
            }
        `,
        {
            variables: {
                id: root.article.toString()
            }
        }
    );

    if (errors && errors.length) {
        throw new Error(errors[0].message);
    }

    return data.article;
}

module.exports = article;
