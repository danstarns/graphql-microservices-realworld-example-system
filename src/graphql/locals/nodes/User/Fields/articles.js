const { gql } = require("apollo-server-express");

async function articles(root, { first, after }, { injections: { execute } }) {
    const { data, errors } = await execute(
        gql`
        {
            articles(
                first: ${first}
                after: "${after}"
                forUser: true
            ) {
                edges {
                   node {
                        id
                        author {
                            id
                            username
                            image
                        }
                        body
                        description
                        favoritesCount
                        slug
                        tagList
                        title
                        createdAt
                        viewerHasFavorited
                   }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    `,
        { context: { user: root.id } }
    );

    if (errors && errors.length) {
        throw new Error(errors[0].message);
    }

    return data.articles;
}

module.exports = articles;
