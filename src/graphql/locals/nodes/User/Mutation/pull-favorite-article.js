const { User } = require("../../../../../models/index.js");

function pullFavoriteArticle(root, { article }, { user }) {
    return User.findByIdAndUpdate(
        user,
        {
            $pull: { "favorites.articles": article }
        },
        { new: true }
    );
}

module.exports = pullFavoriteArticle;
