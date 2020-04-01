const DataLoader = require("dataloader");
const { Article } = require("../../models/index.js");

const articlesLoader = new DataLoader(async (inputIDs) => {
    inputIDs = inputIDs.map((id) => {
        if (id.toString) {
            return id.toString();
        }

        return id;
    });

    const users = await Article.find({
        _id: { $in: inputIDs }
    });

    return inputIDs.map((id) => users.find((x) => id === x.id));
});

module.exports = articlesLoader;
