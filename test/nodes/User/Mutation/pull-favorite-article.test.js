const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("User.Mutation.pullFavoriteArticle", () => {
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
            title: "Beer1"
        });

        await User.findByIdAndUpdate(user._id, {
            $push: { "favorites.articles": article._id }
        });

        const { errors } = await mutate({
            mutation: gql`
                mutation($article: ID!) {
                    pullFavoriteArticle(article: $article) {
                        id
                        favoriteArticles {
                            edges {
                                node {
                                    id
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                article: article._id.toString()
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should remove a favorite article", async () => {
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
            title: "Beer1"
        });

        await User.findByIdAndUpdate(user._id, {
            $push: { "favorites.articles": article._id }
        });

        const { mutate } = await graphql({ user: user._id.toString() });

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($article: ID!) {
                    pullFavoriteArticle(article: $article) {
                        id
                        favoriteArticles {
                            edges {
                                node {
                                    id
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                article: article._id.toString()
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        const { id, favoriteArticles } = data.pullFavoriteArticle;

        expect(id).to.equal(user._id.toString());

        expect(favoriteArticles)
            .to.be.a("object")
            .to.have.property("edges")
            .to.be.a("array")
            .lengthOf(0);

        const { favorites } = await User.findById(user._id);

        expect(favorites)
            .to.be.a("object")
            .to.have.property("articles")
            .to.be.a("array")
            .lengthOf(0);
    });
});
