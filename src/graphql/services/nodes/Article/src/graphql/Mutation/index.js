const favoriteArticle = require("./favorite-article.js");
const unfavoriteArticle = require("./unfavorite-article.js");
const createArticle = require("./create-article.js");
const deleteArticle = require("./delete-article.js");
const updateArticle = require("./update-article.js");

module.exports = {
    createArticle,
    deleteArticle,
    favoriteArticle,
    unfavoriteArticle,
    updateArticle
};
