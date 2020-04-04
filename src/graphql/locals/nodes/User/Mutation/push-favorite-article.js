const { User } = require("../../../../../models/index.js");

function pushFavoriteArticle(root, { article }, { user }) {
    return User.findByIdAndUpdate(
        user,
        {
            $addToSet: { "favorites.articles": article }
        },
        { new: true }
    );
}

module.exports = pushFavoriteArticle;
