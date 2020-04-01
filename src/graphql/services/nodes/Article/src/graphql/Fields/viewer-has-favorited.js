/* eslint-disable camelcase */
const { User } = require("../../models/index.js");

async function viewerHasFavorited({ id }, args, { user: userId }) {
    const user = await User.findById(userId);

    if (!user) {
        return false;
    }

    const articles = user.favorites.articles.map((x) => x.toString());

    if (articles.includes(id)) {
        return true;
    }

    return false;
}

module.exports = viewerHasFavorited;
