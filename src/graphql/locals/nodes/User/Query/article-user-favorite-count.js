const { User } = require("../../../../../models/index.js");

function articleUserFavoriteCount(root, { article }) {
    return User.countDocuments({
        "favorites.articles": article
    });
}

module.exports = articleUserFavoriteCount;
