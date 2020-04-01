const DataLoader = require("dataloader");
const { Comment } = require("../../models/index.js");

const commentsLoader = new DataLoader(async (articleIds) => {
    articleIds = articleIds.map((id) => {
        if (id.toString) {
            return id.toString();
        }

        return id;
    });

    const comments = await Comment.find({
        article: { $in: articleIds }
    });

    return articleIds.map((id) =>
        comments.filter((x) => x.article.toString() === id)
    );
});

module.exports = commentsLoader;
