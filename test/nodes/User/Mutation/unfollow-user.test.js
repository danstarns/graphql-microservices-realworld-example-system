const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("User.Mutation.unfollowUser", () => {
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

        const UnfollowUserInput = {
            id: new mongoose.Types.ObjectId().toString()
        };

        const { errors } = await mutate({
            mutation: gql`
                mutation($UnfollowUserInput: UnfollowUserInput!) {
                    unfollowUser(input: $UnfollowUserInput) {
                        user {
                            id
                            username
                            email
                        }
                    }
                }
            `,
            variables: {
                UnfollowUserInput
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should unfollow a user", async () => {
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

        const followee = await User.create({
            image: "http://cat.com",
            username: "Tester2",
            bio: "Testing always...",
            email: "test2@test2.com",
            password: "secretHASH",
            following: [user._id],
            favorites: {
                articles: []
            }
        });

        const UnfollowUserInput = {
            id: followee._id.toString()
        };

        const { mutate } = await graphql({ user: user._id.toString() });

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($UnfollowUserInput: UnfollowUserInput!) {
                    unfollowUser(input: $UnfollowUserInput) {
                        user {
                            id
                            username
                            email
                        }
                    }
                }
            `,
            variables: {
                UnfollowUserInput
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        const { username, email } = data.unfollowUser.user;

        expect(username).to.equal(followee.username);
        expect(email).to.equal(followee.email);

        const found = await User.findById(user._id);

        expect(
            found.following
                .map((x) => x.toString())
                .includes(followee._id.toString())
        ).to.equal(false);
    });
});
