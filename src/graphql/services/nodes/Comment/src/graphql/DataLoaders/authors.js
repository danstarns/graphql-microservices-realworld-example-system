const DataLoader = require("dataloader");
const { User } = require("../../models/index.js");

const authorsLoader = new DataLoader(async (inputIDs) => {
    inputIDs = inputIDs.map((id) => {
        if (id.toString) {
            return id.toString();
        }

        return id;
    });

    const users = await User.find({
        _id: { $in: inputIDs }
    });

    return inputIDs.map((id) => users.find((x) => id === x.id));
});

module.exports = authorsLoader;
