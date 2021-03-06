const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("User.Mutation.updateUser", () => {
    before(async () => {
        mongoose.set("useCreateIndex", true);
        mongoose.set("useFindAndModify", false);

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        const collections = await mongoose.connection.db.collections();

        await Promise.all(collections.map((collection) => collection.drop()));
    });

    it("should throw unauthorized if no user in context", async () => {
        const { mutate } = await graphql();

        const UpdateUserInput = {
            email: "netemail@test.com",
            username: "user"
        };

        const { errors } = await mutate({
            mutation: gql`
                mutation($UpdateUserInput: UpdateUserInput!) {
                    updateUser(input: $UpdateUserInput) {
                        user {
                            id
                            email
                        }
                    }
                }
            `,
            variables: {
                UpdateUserInput
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should update a user", async () => {
        const user = await User.create({
            image: "http://cat.com",
            username: "Tester",
            bio: "Testing always...",
            email: "test@test.com",
            password: "secretHASH",
            following: [],
            favorites: {
                articles: []
            }
        });

        const UpdateUserInput = {
            email: "netemail@test.com",
            username: user.username
        };

        const { mutate } = await graphql({ user: user._id.toString() });

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($UpdateUserInput: UpdateUserInput!) {
                    updateUser(input: $UpdateUserInput) {
                        user {
                            id
                            email
                        }
                    }
                }
            `,
            variables: {
                UpdateUserInput
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        const { id, email } = data.updateUser.user;

        expect(id).to.equal(user._id.toString());
        expect(email).to.equal(UpdateUserInput.email);
    });
});
