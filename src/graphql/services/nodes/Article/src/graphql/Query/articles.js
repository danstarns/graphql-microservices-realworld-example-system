const gql = require("graphql-tag");
const { Article } = require("../../models/index.js");

async function articles(
    root,
    { first = 10, after = "1", tag, forUser, feed, ids },
    { user, injections: { execute } }
) {
    const query = {};

    if (user) {
        const { data, errors } = await execute(
            gql`
                query($id: ID!) {
                    user: userById(id: $id) {
                        id
                        email
                        following {
                            nodes {
                                id
                            }
                        }
                    }
                }
            `,
            { variables: { id: user } }
        );

        if (errors && errors.length) {
            throw new Error(errors[0].message);
        }

        user = data.user;
    }

    if (tag) {
        query.tagList = tag;
    }

    if (forUser) {
        query.author = user.id;
    }

    if (feed) {
        query.author = { $in: user.nodes.map((x) => x.id) };
    }

    if (ids) {
        query._id = { $in: ids };
    }

    const pagination = {
        limit: Number(first) || 50,
        page: Number(after),
        sort: {
            createdAt: "descending"
        },
        lean: true
    };

    const { docs, hasNextPage } = await Article.paginate(query, pagination);

    return {
        edges: docs.map((doc) => ({
            cursor: doc.id,
            node: doc
        })),
        pageInfo: {
            endCursor: hasNextPage ? String(Number(after) + 1) : null,
            hasNextPage
        }
    };
}

module.exports = articles;
