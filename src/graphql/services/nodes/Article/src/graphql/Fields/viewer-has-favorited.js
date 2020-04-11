const gql = require("graphql-tag");

async function viewerHasFavorited(
    { id },
    args,
    { user, injections: { execute } }
) {
    if (!user) {
        return false;
    }

    const { data, errors } = await execute(
        gql`
            query($id: ID!) {
                userById(id: $id) {
                    favoriteArticles {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            }
        `,
        {
            variables: {
                id: user
            }
        }
    );

    if (errors && errors.length) {
        throw new Error(errors[0].message);
    }

    const articles = data.userById.favoriteArticles.edges.map((x) => x.node.id);

    if (articles.includes(id)) {
        return true;
    }

    return false;
}

module.exports = viewerHasFavorited;
