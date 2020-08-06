const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article, Comment } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("Comment.Mutation.addComment", () => {
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

        const AddCommentInput = {
            articleId: new mongoose.Types.ObjectId().toString(),
            body: "Cool post!"
        };

        const { errors } = await mutate({
            mutation: gql`
                mutation($AddCommentInput: AddCommentInput!) {
                    addComment(input: $AddCommentInput) {
                        comment {
                            id
                        }
                    }
                }
            `,
            variables: {
                AddCommentInput
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should add a comment", async () => {
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

        const AddCommentInput = {
            articleId: article._id.toString(),
            body: "Cool post!"
        };

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($AddCommentInput: AddCommentInput!) {
                    addComment(input: $AddCommentInput) {
                        comment {
                            id
                            article {
                                id
                                title
                            }
                            author {
                                id
                                username
                            }
                            body
                        }
                        errors {
                            message
                            path
                        }
                    }
                }
            `,
            variables: {
                AddCommentInput
            }
        });

        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        }

        expect(errors).to.equal(undefined);

        expect(data.addComment).to.be.a("object");

        expect(data.addComment.errors)
            .to.be.a("array")
            .lengthOf(0);

        expect(data.addComment.comment).to.have.property("id");

        expect(data.addComment.comment.article)
            .to.have.property("id")
            .to.equal(AddCommentInput.articleId);

        expect(data.addComment.comment.article)
            .to.have.property("title")
            .to.equal(article.title);

        expect(data.addComment.comment.author)
            .to.have.property("id")
            .to.equal(user._id.toString());

        expect(data.addComment.comment.author)
            .to.have.property("username")
            .to.equal(user.username);

        expect(data.addComment.comment)
            .to.have.property("body")
            .to.equal(AddCommentInput.body);

        const [found] = await Comment.find();

        expect(found._id.toString()).equal(data.addComment.comment.id);
    });
});
