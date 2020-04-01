async function article(
    { article: articleID },
    args,
    { injections: { DataLoaders } }
) {
    return DataLoaders.articles.load(articleID);
}

module.exports = article;
