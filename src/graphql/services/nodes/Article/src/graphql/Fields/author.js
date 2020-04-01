const {
    Types: { ObjectId }
} = require("mongoose");

function author(
    { author: authorInstance },
    args,
    { injections: { DataLoaders } }
) {
    if (ObjectId.isValid(authorInstance)) {
        return DataLoaders.authors.load(authorInstance);
    }

    return DataLoaders.authors.load(authorInstance.id);
}

module.exports = author;
