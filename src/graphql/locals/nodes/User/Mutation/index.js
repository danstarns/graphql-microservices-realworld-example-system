const createUser = require("./create-user.js");
const followUser = require("./follow-user.js");
const signInUser = require("./sign-in-user.js");
const unfollowUser = require("./unfollow-user");
const updateUser = require("./update-user.js");

module.exports = {
    createUser,
    followUser,
    signInUser,
    unfollowUser,
    updateUser
};
