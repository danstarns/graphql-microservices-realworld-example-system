const { User } = require("../../../../../models/index.js");

async function followers(root) {
    const totalCount = await User.countDocuments({ following: root.id });

    return { totalCount };
}

module.exports = followers;
