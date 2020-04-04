const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("Article.Query.articles", () => {
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

    it("should get the first 2 articles by tag", async () => {
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

        const article1 = await Article.create({
            author: user._id,
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer1"
        });

        const article2 = await Article.create({
            author: user._id,
            body: "I still love beer!",
            description: "Me still talking about beer...",
            tagList: ["beer", "bongs"],
            title: "Beer2"
        });

        await Article.create({
            author: user._id,
            body: "Random",
            description: "...",
            tagList: ["not", "related"],
            title: "Random"
        });

        const { data, errors } = await query({
            query: gql`
                query($tag: String, $first: Int, $after: String) {
                    articles(first: $first, after: $after, tag: $tag) {
                        edges {
                            cursor
                            node {
                                id
                                author {
                                    id
                                    username
                                }
                                body
                                description
                                favoritesCount
                                slug
                                tagList
                                title
                                viewerHasFavorited
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }
            `,
            variables: { first: 3, after: "1", tag: "beer" }
        });

        expect(errors).to.equal(undefined);

        expect(data.articles).to.be.a("object");
        expect(data.articles.pageInfo).to.be.a("object");
        expect(data.articles.edges)
            .to.be.a("array")
            .lengthOf(2);

        expect(data.articles.pageInfo.hasNextPage).to.equal(false);
        expect(data.articles.pageInfo.endCursor).to.equal(null);

        expect(data.articles.edges[0].cursor).to.equal(article2._id.toString());
        expect(data.articles.edges[0].node).to.be.a("object");
        expect(data.articles.edges[0].node.id).to.equal(
            article2._id.toString()
        );
        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.articles.edges[0].node)
            .to.have.property("body")
            .to.equal(article2.body);

        expect(data.articles.edges[0].node)
            .to.have.property("description")
            .to.equal(article2.description);

        expect(data.articles.edges[0].node)
            .to.have.property("favoritesCount")
            .to.equal(0);

        expect(data.articles.edges[0].node)
            .to.have.property("slug")
            .to.contain(article2._id.toString());

        expect(data.articles.edges[0].node.tagList).to.be.a("array");

        expect(data.articles.edges[0].node.tagList[0]).to.equal("beer");

        expect(data.articles.edges[0].node.tagList[1]).to.equal("bongs");

        expect(data.articles.edges[0].node)
            .to.have.property("title")
            .to.equal(article2.title);

        expect(data.articles.edges[0].node)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);

        expect(data.articles.edges[1].cursor).to.equal(article1._id.toString());
        expect(data.articles.edges[1].node).to.be.a("object");
        expect(data.articles.edges[1].node.id).to.equal(
            article1._id.toString()
        );
        expect(data.articles.edges[1].node.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.articles.edges[1].node.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.articles.edges[1].node)
            .to.have.property("body")
            .to.equal(article1.body);

        expect(data.articles.edges[1].node)
            .to.have.property("description")
            .to.equal(article1.description);

        expect(data.articles.edges[1].node)
            .to.have.property("favoritesCount")
            .to.equal(0);

        expect(data.articles.edges[1].node)
            .to.have.property("slug")
            .to.contain(article1._id.toString());

        expect(data.articles.edges[1].node.tagList).to.be.a("array");

        expect(data.articles.edges[1].node.tagList[0]).to.equal("beer");

        expect(data.articles.edges[1].node.tagList[1]).to.equal("bongs");

        expect(data.articles.edges[1].node)
            .to.have.property("title")
            .to.equal(article1.title);

        expect(data.articles.edges[1].node)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);
    });

    it("should return only user articles", async () => {
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

        const article = await Article.create({
            author: user._id,
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer"
        });

        await Article.create({
            author: new mongoose.Types.ObjectId(),
            body: "Random",
            description: "...",
            tagList: ["not", "related"],
            title: "Random"
        });

        // eslint-disable-next-line no-shadow
        const { query } = graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($forUser: Boolean, $first: Int, $after: String) {
                    articles(first: $first, after: $after, forUser: $forUser) {
                        edges {
                            cursor
                            node {
                                id
                                author {
                                    id
                                    username
                                }
                                body
                                description
                                favoritesCount
                                slug
                                tagList
                                title
                                viewerHasFavorited
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }
            `,
            variables: { first: 3, after: "1", forUser: true }
        });

        expect(errors).to.equal(undefined);

        expect(data.articles).to.be.a("object");
        expect(data.articles.pageInfo).to.be.a("object");
        expect(data.articles.edges)
            .to.be.a("array")
            .lengthOf(1);

        expect(data.articles.edges[0].cursor).to.equal(article._id.toString());
        expect(data.articles.edges[0].node).to.be.a("object");
        expect(data.articles.edges[0].node.id).to.equal(article._id.toString());
        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.articles.edges[0].node)
            .to.have.property("body")
            .to.equal(article.body);

        expect(data.articles.edges[0].node)
            .to.have.property("description")
            .to.equal(article.description);

        expect(data.articles.edges[0].node)
            .to.have.property("favoritesCount")
            .to.equal(0);

        expect(data.articles.edges[0].node)
            .to.have.property("slug")
            .to.contain(article._id.toString());

        expect(data.articles.edges[0].node.tagList).to.be.a("array");

        expect(data.articles.edges[0].node.tagList[0]).to.equal("beer");

        expect(data.articles.edges[0].node.tagList[1]).to.equal("bongs");

        expect(data.articles.edges[0].node)
            .to.have.property("title")
            .to.equal(article.title);

        expect(data.articles.edges[0].node)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);
    });

    it("should return a users feed of articles", async () => {
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

        const article = await Article.create({
            author: followee._id,
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer"
        });

        await Article.create({
            author: new mongoose.Types.ObjectId(),
            body: "Random",
            description: "...",
            tagList: ["not", "related"],
            title: "Random"
        });

        // eslint-disable-next-line no-shadow
        const { query } = graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($feed: Boolean, $first: Int, $after: String) {
                    articles(first: $first, after: $after, feed: $feed) {
                        edges {
                            cursor
                            node {
                                id
                                author {
                                    id
                                    username
                                }
                                body
                                description
                                favoritesCount
                                slug
                                tagList
                                title
                                viewerHasFavorited
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }
            `,
            variables: { first: 3, after: "1", feed: true }
        });

        expect(errors).to.equal(undefined);

        expect(data.articles).to.be.a("object");
        expect(data.articles.pageInfo).to.be.a("object");
        expect(data.articles.edges)
            .to.be.a("array")
            .lengthOf(1);

        expect(data.articles.edges[0].cursor).to.equal(article._id.toString());
        expect(data.articles.edges[0].node).to.be.a("object");
        expect(data.articles.edges[0].node.id).to.equal(article._id.toString());
        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(followee._id.toString());

        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(followee.username);

        expect(data.articles.edges[0].node)
            .to.have.property("body")
            .to.equal(article.body);

        expect(data.articles.edges[0].node)
            .to.have.property("description")
            .to.equal(article.description);

        expect(data.articles.edges[0].node)
            .to.have.property("favoritesCount")
            .to.equal(0);

        expect(data.articles.edges[0].node)
            .to.have.property("slug")
            .to.contain(article._id.toString());

        expect(data.articles.edges[0].node.tagList).to.be.a("array");

        expect(data.articles.edges[0].node.tagList[0]).to.equal("beer");

        expect(data.articles.edges[0].node.tagList[1]).to.equal("bongs");

        expect(data.articles.edges[0].node)
            .to.have.property("title")
            .to.equal(article.title);

        expect(data.articles.edges[0].node)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);
    });

    it("should query for an array of article ids", async () => {
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

        const article1 = await Article.create({
            author: user._id,
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer1"
        });

        const article2 = await Article.create({
            author: user._id,
            body: "I still love beer!",
            description: "Me still talking about beer...",
            tagList: ["beer", "bongs"],
            title: "Beer2"
        });

        await Article.create({
            author: user._id,
            body: "Random",
            description: "...",
            tagList: ["not", "related"],
            title: "Random"
        });

        const { data, errors } = await query({
            query: gql`
                query($ids: [String], $first: Int, $after: String) {
                    articles(first: $first, after: $after, ids: $ids) {
                        edges {
                            cursor
                            node {
                                id
                                author {
                                    id
                                    username
                                }
                                body
                                description
                                favoritesCount
                                slug
                                tagList
                                title
                                viewerHasFavorited
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }
            `,
            variables: {
                first: 3,
                after: "1",
                ids: [article1._id.toString(), article2._id.toString()]
            }
        });

        expect(errors).to.equal(undefined);

        expect(data.articles).to.be.a("object");
        expect(data.articles.pageInfo).to.be.a("object");
        expect(data.articles.edges)
            .to.be.a("array")
            .lengthOf(2);

        expect(data.articles.pageInfo.hasNextPage).to.equal(false);
        expect(data.articles.pageInfo.endCursor).to.equal(null);

        expect(data.articles.edges[0].cursor).to.equal(article2._id.toString());
        expect(data.articles.edges[0].node).to.be.a("object");
        expect(data.articles.edges[0].node.id).to.equal(
            article2._id.toString()
        );
        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.articles.edges[0].node.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.articles.edges[0].node)
            .to.have.property("body")
            .to.equal(article2.body);

        expect(data.articles.edges[0].node)
            .to.have.property("description")
            .to.equal(article2.description);

        expect(data.articles.edges[0].node)
            .to.have.property("favoritesCount")
            .to.equal(0);

        expect(data.articles.edges[0].node)
            .to.have.property("slug")
            .to.contain(article2._id.toString());

        expect(data.articles.edges[0].node.tagList).to.be.a("array");

        expect(data.articles.edges[0].node.tagList[0]).to.equal("beer");

        expect(data.articles.edges[0].node.tagList[1]).to.equal("bongs");

        expect(data.articles.edges[0].node)
            .to.have.property("title")
            .to.equal(article2.title);

        expect(data.articles.edges[0].node)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);

        expect(data.articles.edges[1].cursor).to.equal(article1._id.toString());
        expect(data.articles.edges[1].node).to.be.a("object");
        expect(data.articles.edges[1].node.id).to.equal(
            article1._id.toString()
        );
        expect(data.articles.edges[1].node.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.articles.edges[1].node.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.articles.edges[1].node)
            .to.have.property("body")
            .to.equal(article1.body);

        expect(data.articles.edges[1].node)
            .to.have.property("description")
            .to.equal(article1.description);

        expect(data.articles.edges[1].node)
            .to.have.property("favoritesCount")
            .to.equal(0);

        expect(data.articles.edges[1].node)
            .to.have.property("slug")
            .to.contain(article1._id.toString());

        expect(data.articles.edges[1].node.tagList).to.be.a("array");

        expect(data.articles.edges[1].node.tagList[0]).to.equal("beer");

        expect(data.articles.edges[1].node.tagList[1]).to.equal("bongs");

        expect(data.articles.edges[1].node)
            .to.have.property("title")
            .to.equal(article1.title);

        expect(data.articles.edges[1].node)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);
    });
});
