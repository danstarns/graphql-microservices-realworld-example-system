const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("User.Query.user", () => {
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

    it("should get a user", async () => {
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
                query($username: String!) {
                    user(username: $username) {
                        id
                        image
                        bio
                        email
                        followedByViewer
                    }
                }
            `,
            variables: {
                username: user.username
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.user.id).to.be.equal(user._id.toString());

        expect(data.user.image).to.be.equal(user.image);

        expect(data.user.bio).to.be.equal(user.bio);

        expect(data.user.email).to.be.equal(user.email);

        expect(data.user.followedByViewer).to.be.equal(false);
    });

    it("should get a user and return its articles", async () => {
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

        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($username: String!) {
                    user(username: $username) {
                        id
                        image
                        bio
                        email
                        followedByViewer
                        articles {
                            edges {
                                node {
                                    id
                                    body
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                username: user.username
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.user.id).to.be.equal(user._id.toString());

        expect(data.user.image).to.be.equal(user.image);

        expect(data.user.bio).to.be.equal(user.bio);

        expect(data.user.email).to.be.equal(user.email);

        expect(data.user.followedByViewer).to.be.equal(false);

        expect(data.user.articles)
            .to.be.a("object")
            .to.have.property("edges")
            .to.be.a("array")
            .lengthOf(1);

        const [{ node }] = data.user.articles.edges;

        expect(node)
            .to.have.property("id")
            .to.equal(article._id.toString());

        expect(node)
            .to.have.property("body")
            .to.equal(article.body);
    });

    it("should get a user and return its favorite articles", async () => {
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
            author: user._id,
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer"
        });

        await User.findByIdAndUpdate(user._id, {
            $push: {
                "favorites.articles": article._id
            }
        });

        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($username: String!) {
                    user(username: $username) {
                        id
                        image
                        bio
                        email
                        followedByViewer
                        favoriteArticles {
                            edges {
                                node {
                                    id
                                    body
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                username: user.username
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.user.id).to.be.equal(user._id.toString());

        expect(data.user.image).to.be.equal(user.image);

        expect(data.user.bio).to.be.equal(user.bio);

        expect(data.user.email).to.be.equal(user.email);

        expect(data.user.followedByViewer).to.be.equal(false);

        expect(data.user.favoriteArticles)
            .to.be.a("object")
            .to.have.property("edges")
            .to.be.a("array")
            .lengthOf(1);

        const [{ node }] = data.user.favoriteArticles.edges;

        expect(node)
            .to.have.property("id")
            .to.equal(article._id.toString());

        expect(node)
            .to.have.property("body")
            .to.equal(article.body);
    });

    it("should get a user and return its followers totalCount", async () => {
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

        await User.create({
            image: "http://cat.com",
            username: "Follower",
            bio: "Following always...",
            email: "followe@followe.com",
            password: "secretHASH",
            following: [user._id],
            favorites: {
                articles: []
            }
        });

        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($username: String!) {
                    user(username: $username) {
                        id
                        image
                        bio
                        email
                        followedByViewer
                        followers {
                            totalCount
                        }
                    }
                }
            `,
            variables: {
                username: user.username
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.user.id).to.be.equal(user._id.toString());

        expect(data.user.image).to.be.equal(user.image);

        expect(data.user.bio).to.be.equal(user.bio);

        expect(data.user.email).to.be.equal(user.email);

        expect(data.user.followedByViewer).to.be.equal(false);

        expect(data.user.followers.totalCount).equal(1);
    });

    it("should get a user and return its followers", async () => {
        const followee = await User.create({
            image: "http://cat.com",
            username: "Follower",
            bio: "Following always...",
            email: "followe@followe.com",
            password: "secretHASH",
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

        const { query } = await graphql({ user: user._id.toString() });

        const { data, errors } = await query({
            query: gql`
                query($username: String!) {
                    user(username: $username) {
                        id
                        image
                        bio
                        email
                        followedByViewer
                        following {
                            nodes {
                                id
                            }
                        }
                    }
                }
            `,
            variables: {
                username: user.username
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data).to.be.a("object");

        expect(data.user.id).to.be.equal(user._id.toString());

        expect(data.user.image).to.be.equal(user.image);

        expect(data.user.bio).to.be.equal(user.bio);

        expect(data.user.email).to.be.equal(user.email);

        expect(data.user.followedByViewer).to.be.equal(false);

        expect(data.user.following)
            .to.be.a("object")
            .to.have.property("nodes")
            .to.be.a("array")
            .lengthOf(1);

        const [{ id }] = data.user.following.nodes;

        expect(id).to.equal(followee._id.toString());
    });
});
