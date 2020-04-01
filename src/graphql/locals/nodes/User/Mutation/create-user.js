const { User } = require("../../../../../models/index.js");
const { hashPassword } = require("../../../../../util/index.js");

async function createUser(root, args) {
    const {
        input: { username, email, password }
    } = args;

    const CreateUserPayload = { errors: [], user: null };

    try {
        const existing = await User.findOne({ username });

        if (existing) {
            throw new Error("Email has already been taken");
        }

        const hash = await hashPassword(password);

        return {
            ...CreateUserPayload,
            user: await User.create({ username, email, password: hash })
        };
    } catch ({ message, stack }) {
        return {
            ...CreateUserPayload,
            errors: [{ message, path: stack }]
        };
    }
}

module.exports = createUser;
