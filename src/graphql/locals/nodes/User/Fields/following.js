const { User } = require("../../../../../models/index.js");

/**
 * @todo paginate
 */
async function following(root) {
    const { following: ids = [] } =
        (await User.findById(root.id).select("following")) || {};

    const nodes = await User.find({ _id: { $in: ids } });

    return { nodes, totalCount: nodes.length };
}

module.exports = following;
