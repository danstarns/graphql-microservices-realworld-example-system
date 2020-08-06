const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const graphql = require("../../../graphql.js");
const { User, Article } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");

describe("Article.Mutation.unfavoriteArticle", () => {
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

        const UnfavoriteArticleInput = {
            id: new mongoose.Types.ObjectId().toString()
        };

        const { errors } = await mutate({
            mutation: gql`
                mutation($UnfavoriteArticleInput: UnfavoriteArticleInput!) {
                    unfavoriteArticle(input: $UnfavoriteArticleInput) {
                        article {
                            id
                            body
                            title
                        }
                    }
                }
            `,
            variables: {
                UnfavoriteArticleInput
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should unFavorite a article", async () => {
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

        await User.findByIdAndUpdate(user._id, {
            $push: { "favorites.articles": article._id }
        });

        const { mutate } = await graphql({ user: user._id.toString() });

        const UnfavoriteArticleInput = {
            id: article._id.toString()
        };

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($UnfavoriteArticleInput: UnfavoriteArticleInput!) {
                    unfavoriteArticle(input: $UnfavoriteArticleInput) {
                        article {
                            id
                            body
                            title
                        }
                    }
                }
            `,
            variables: {
                UnfavoriteArticleInput
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data.unfavoriteArticle).to.be.a("object");

        expect(data.unfavoriteArticle.article)
            .to.have.property("id")
            .to.equal(article._id.toString());

        const updatedUser = await User.findById(user._id).lean();

        expect(
            updatedUser.favorites.articles
                .map((x) => x.toString())
                .includes(article._id.toString())
        ).to.equal(false);
    });
});
