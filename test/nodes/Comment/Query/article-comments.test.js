const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article, Comment } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("Comment.Query.articleComments", () => {
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

    it("should return article comments", async () => {
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

        const comment = await Comment.create({
            article: article._id,
            author: user._id,
            body: "Cool post!"
        });

        const { data, errors } = await mutate({
            mutation: gql`
                query($article: ID!) {
                    articleComments(article: $article) {
                        id
                        article {
                            id
                        }
                        author {
                            id
                        }
                        body
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

        expect(data)
            .to.be.a("object")
            .to.have.property("articleComments")
            .to.be.a("array")
            .lengthOf(1);

        const [
            {
                id,
                article: { id: articleId },
                author: { id: authorId },
                body
            }
        ] = data.articleComments;

        expect(id).to.equal(comment._id.toString());

        expect(articleId).to.equal(article._id.toString());

        expect(authorId).to.equal(user._id.toString());

        expect(body).to.equal(comment.body);
    });
});
