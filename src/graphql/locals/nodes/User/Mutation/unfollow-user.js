const { User } = require("../../../../../models/index.js");

async function unfollowUser(root, { input: { id } }, { user: requester }) {
    try {
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        await User.findByIdAndUpdate(requester, {
            $pull: { following: id }
        });

        return {
            user
        };
    } catch (error) {
        return {
            user: null
        };
    }
}

module.exports = unfollowUser;
