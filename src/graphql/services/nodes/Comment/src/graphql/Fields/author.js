async function author(
    { author: authorID },
    args,
    { injections: { DataLoaders } }
) {
    return DataLoaders.authors.load(authorID);
}

module.exports = author;
