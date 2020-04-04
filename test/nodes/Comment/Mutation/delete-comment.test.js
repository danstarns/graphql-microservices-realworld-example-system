const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { User, Article, Comment } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("Comment.Mutation.deleteComment", () => {
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

        const DeleteCommentInput = {
            id: new mongoose.Types.ObjectId().toString()
        };

        const { errors } = await mutate({
            mutation: gql`
                mutation($DeleteCommentInput: DeleteCommentInput!) {
                    deleteComment(input: $DeleteCommentInput) {
                        comment {
                            id
                        }
                    }
                }
            `,
            variables: {
                DeleteCommentInput
            }
        });

        expect(errors)
            .to.be.a("array")
            .lengthOf(1);

        const [{ message }] = errors;

        expect(message).to.equal("unauthorized");
    });

    it("should delete a comment", async () => {
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

        const comment = await Comment.create({
            article: article._id,
            author: user._id,
            body: "Cool Post"
        });

        const { mutate } = await graphql({ user: user._id.toString() });

        const DeleteCommentInput = {
            id: comment._id.toString()
        };

        const { data, errors } = await mutate({
            mutation: gql`
                mutation($DeleteCommentInput: DeleteCommentInput!) {
                    deleteComment(input: $DeleteCommentInput) {
                        comment {
                            id
                        }
                    }
                }
            `,
            variables: {
                DeleteCommentInput
            }
        });

        expect(errors).to.equal(undefined);

        expect(data.deleteComment).to.be.a("object");

        expect(data.deleteComment.comment)
            .to.have.property("id")
            .to.equal(DeleteCommentInput.id);

        const count = await Comment.countDocuments();

        expect(count).to.equal(0);
    });
});
