const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("Article.Query.viewer", () => {
    let query;

    before(async () => {
        mongoose.set("useCreateIndex", true);
        mongoose.set("useFindAndModify", false);

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        ({ query } = await graphql());
    });

    after(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        const collections = await mongoose.connection.db.collections();

        await Promise.all(collections.map((collection) => collection.drop()));
    });

    it("should return a viewer based on a whom a user is following", async () => {
        const followee = await User.create({
            image: "http://followee.com",
            username: "followee",
            bio: "Testing always...",
            email: "followee@followee.com",
            password: "followeeHASH",
            following: [],
            favorites: {
                articles: []
            }
        });

        const user = await User.create({
            image: "http://cat.com",
            username: "Tester",
            bio: "Testing always...",
            email: "test@test.com",
            password: "secretHASH",
            following: [followee._id],
            favorites: {
                articles: []
            }
        });

        await Article.create({
            author: user._id,
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer"
        });

        const followeeArticle = await Article.create({
            author: followee._id,
            body: "I love beer too!",
            description: "Me also talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer"
        });

        // eslint-disable-next-line no-shadow
        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($first: Int, $after: String) {
                    viewer {
                        feed(first: $first, after: $after) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            edges {
                                cursor
                                node {
                                    id
                                }
                            }
                        }
                        user {
                            id
                        }
                    }
                }
            `,
            variables: { first: 10, after: "1" }
        });

        expect(errors).to.equal(undefined);

        expect(data.viewer.user.id).to.equal(user._id.toString());

        expect(data.viewer.feed.pageInfo.hasNextPage).to.equal(false);

        expect(data.viewer.feed.pageInfo.endCursor).to.equal(null);

        expect(data.viewer.feed.edges)
            .to.been.a("array")
            .lengthOf(1);

        const edge = data.viewer.feed.edges[0];

        expect(edge)
            .to.have.property("cursor")
            .to.equal(followeeArticle._id.toString());

        expect(edge.node)
            .to.have.property("id")
            .to.equal(followeeArticle._id.toString());
    });
});
