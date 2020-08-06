const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article } = require("../../../models/index.js");
const graphql = require("../../../graphql.js");
const { MONGODB_URI } = require("../../../../src/config.js");

describe("Article.Mutation.deleteArticle", () => {
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

        const DeleteArticleInput = {
            id: new mongoose.Types.ObjectId().toString()
        };

        const { errors } = await mutate({
            mutation: gql`
                mutation($DeleteArticleInput: DeleteArticleInput!) {
                    deleteArticle(input: $DeleteArticleInput) {
                        article {
                            id
                        }
                    }
                }
            `,
            variables: {
                DeleteArticleInput
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should delete a article", async () => {
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

        const { mutate } = await graphql({ user: user._id.toString() });

        const DeleteArticleInput = {
            id: article._id.toString()
        };

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($DeleteArticleInput: DeleteArticleInput!) {
                    deleteArticle(input: $DeleteArticleInput) {
                        article {
                            id
                        }
                    }
                }
            `,
            variables: {
                DeleteArticleInput
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data.deleteArticle).to.be.a("object");

        expect(data.deleteArticle.article)
            .to.have.property("id")
            .to.equal(article._id.toString());

        const articles = await Article.find();

        expect(articles.length).to.equal(0);
    });
});
