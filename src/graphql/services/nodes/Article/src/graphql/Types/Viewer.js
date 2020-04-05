const { GraphQLType } = require("idio-graphql");
const gql = require("graphql-tag");

const Viewer = new GraphQLType({
    name: "Viewer",
    typeDefs: gql`
        type Viewer {
            feed(first: Int, after: String): ArticleConnection!
            user: User
        }
    `,
    resolvers: {
        feed: async (
            root,
            { first, after },
            { user, injections: { execute } }
        ) => {
            const { data, errors } = await execute(
                gql`
                {
                    articles(
                        first: ${first}
                        after: "${after}"
                        ${user ? `feed: true` : ``}
                    ) {
                        edges {
                            cursor
                            node {
                                id
                                slug
                                title
                                description
                                favoritesCount
                                createdAt
                                viewerHasFavorited
                                favoritesCount
                                author {
                                  id
                                  username
                                  image
                                }
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }
            `,
                { context: { user } }
            );

            if (errors && errors.length) {
                throw new Error(errors[0].message);
            }

            return data.articles;
        },
        user: async ({ user: { id } }, args, { injections: { execute } }) => {
            const { data, errors } = await execute(
                gql`
                    query($id: ID!) {
                        user: userById(id: $id) {
                            id
                            image
                            username
                            bio
                            email
                        }
                    }
                `,
                { variables: { id } }
            );

            if (errors && errors.length) {
                throw new Error(errors[0].message);
            }

            return data.user;
        }
    }
});

module.exports = Viewer;
