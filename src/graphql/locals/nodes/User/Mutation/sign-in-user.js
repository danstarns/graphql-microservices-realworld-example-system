const { AuthenticationError } = require("apollo-server-express");
const { comparePassword, createJWT } = require("../../../../../util/index.js");
const { User } = require("../../../../../models/index.js");

async function signInUser(root, args) {
    const {
        input: { email, password }
    } = args;

    const SignInUserPayload = { errors: [], token: null, viewer: null };

    try {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AuthenticationError("unauthorized");
        }

        const { password: hash } = user;

        const valid = await comparePassword(password, hash);

        if (!valid) {
            throw new AuthenticationError("unauthorized");
        }

        const token = await createJWT(user);

        return {
            ...SignInUserPayload,
            token,
            viewer: {
                user
            }
        };
    } catch ({ message, stack }) {
        return {
            ...SignInUserPayload,
            errors: [{ message, path: stack }]
        };
    }
}

module.exports = signInUser;
