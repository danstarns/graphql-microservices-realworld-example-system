const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("User.Query.articleUserFavoriteCount", () => {
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

    it("should return favorite count for article", async () => {
        const articleId = new mongoose.Types.ObjectId();

        const user = await User.create({
            image: "http://cat.com",
            username: "Tester",
            bio: "Testing always...",
            email: "test@test.com",
            password: "secretHASH",
            following: [],
            favorites: {
                articles: [articleId]
            }
        });

        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($article: ID!) {
                    articleUserFavoriteCount(article: $article)
                }
            `,
            variables: {
                article: articleId.toString()
            }
        });

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.articleUserFavoriteCount).to.equal(1);
    });
});
