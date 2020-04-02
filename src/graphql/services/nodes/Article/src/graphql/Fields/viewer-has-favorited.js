const gql = require("graphql-tag");

async function viewerHasFavorited(
    { id },
    args,
    { user, injections: { execute } }
) {
    const { data, errors } = await execute(
        gql`
            query($id: ID!) {
                userById(id: $id) {
                    favorites {
                        articles {
                            id
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

    if (!data.userById) {
        return false;
    }

    const articles = data.userById.favorites.articles.map((x) => x.id);

    if (articles.includes(id)) {
        return true;
    }

    return false;
}

module.exports = viewerHasFavorited;
