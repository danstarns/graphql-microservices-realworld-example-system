const { User } = require("../../../../../models/index.js");

async function followedByViewer(root, args, { user: userId }) {
    const user = await User.findById(userId);

    if (!user) {
        return false;
    }

    const userFollowers = user.following.map((x) => x.toString());

    if (userFollowers.includes(root.id)) {
        return true;
    }

    return false;
}

module.exports = followedByViewer;
