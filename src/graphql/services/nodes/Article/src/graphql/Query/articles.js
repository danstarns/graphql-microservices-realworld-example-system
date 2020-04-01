const { Article, User } = require("../../models/index.js");

async function articles(
    root,
    { first = 10, after = "1", tag, forUser, feed, ids },
    { user }
) {
    const query = {};

    user = await User.findById(user);

    if (tag) {
        query.tagList = tag;
    }

    if (forUser) {
        query.author = user.id;
    }

    if (feed) {
        query.author = { $in: user.following };
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
