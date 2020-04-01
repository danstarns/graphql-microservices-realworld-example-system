async function comments({ id }, args, { injections: { DataLoaders } }) {
    const result = await DataLoaders.comments.load(id);

    if (!result) {
        return [];
    }

    return result;
}

module.exports = comments;
