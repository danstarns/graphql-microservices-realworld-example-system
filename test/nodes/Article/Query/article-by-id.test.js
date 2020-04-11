const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { MONGODB_URI } = require("../../../../src/config.js");
const { Article, User, Comment } = require("../../../models/index.js");
const graphql = require("../../../graphql.js");

describe("Article.Query.articleById", () => {
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

    it("should find a article by id", async () => {
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

        const comment = await Comment.create({
            article: article._id,
            author: user._id,
            body: "Testing"
        });

        const { data, errors } = await query({
            query: gql`
                query($id: ID!) {
                    article: articleById(id: $id) {
                        id
                        author {
                            id
                            username
                        }
                        body
                        comments {
                            id
                            body
                        }
                        description
                        favoritesCount
                        slug
                        tagList
                        title
                        viewerHasFavorited
                    }
                }
            `,
            variables: { id: article._id.toString() }
        });

        expect(errors).to.equal(undefined);

        expect(data.article).to.be.a("object");

        expect(data.article)
            .to.have.property("id")
            .to.equal(article._id.toString());

        expect(data.article.author)
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.article.author)
            .to.be.a("object")
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.article)
            .to.have.property("body")
            .to.equal(article.body);

        expect(data.article.comments).to.be.a("array");

        expect(data.article.comments[0])
            .to.be.a("object")
            .to.have.property("id")
            .to.equal(comment._id.toString());

        expect(data.article.comments[0])
            .to.be.a("object")
            .to.have.property("body")
            .to.equal(comment.body);

        expect(data.article)
            .to.have.property("description")
            .to.equal(article.description);

        expect(data.article)
            .to.have.property("favoritesCount")
            .to.equal(1);

        expect(data.article)
            .to.have.property("slug")
            .to.contain(article._id.toString());

        expect(data.article.tagList).to.be.a("array");

        expect(data.article.tagList[0]).to.equal("beer");

        expect(data.article.tagList[1]).to.equal("bongs");

        expect(data.article)
            .to.have.property("title")
            .to.equal(article.title);

        expect(data.article)
            .to.have.property("viewerHasFavorited")
            .to.equal(false);
    });
});
