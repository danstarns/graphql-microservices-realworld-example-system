const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("User.Query.userById", () => {
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

    it("should get a user by id", async () => {
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

        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($id: ID!) {
                    userById(id: $id) {
                        id
                        image
                        bio
                        email
                        followedByViewer
                    }
                }
            `,
            variables: {
                id: user._id.toString()
            }
        });

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.userById.id).to.be.equal(user._id.toString());

        expect(data.userById.image).to.be.equal(user.image);

        expect(data.userById.bio).to.be.equal(user.bio);

        expect(data.userById.email).to.be.equal(user.email);

        expect(data.userById.followedByViewer).to.be.equal(false);
    });
});
