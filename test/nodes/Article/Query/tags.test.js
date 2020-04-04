const { gql } = require("apollo-server-express");
const { expect } = require("chai");
const mongoose = require("mongoose");
const { Article } = require("../../../models/index.js");
const { MONGODB_URI } = require("../../../../src/config.js");
const graphql = require("../../../graphql.js");

describe("Article.Query.tags", () => {
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

    it("should return a list of tags", async () => {
        await Article.create({
            author: new mongoose.Types.ObjectId(),
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["beer", "bongs"],
            title: "Beer"
        });

        await Article.create({
            author: new mongoose.Types.ObjectId(),
            body: "I love beer!",
            description: "Me talking about beer",
            tagList: ["coffee", "beer"],
            title: "Beer"
        });

        const { data, errors } = await query({
            query: gql`
                query {
                    tags
                }
            `
        });

        expect(errors).to.equal(undefined);

        expect(data.tags)
            .to.be.a("array")
            .lengthOf(3);

        const includesBeer = data.tags.includes("beer");
        const includesCoffee = data.tags.includes("coffee");
        const includesBongs = data.tags.includes("bongs");

        expect(includesBeer).to.equal(true);
        expect(includesCoffee).to.equal(true);
        expect(includesBongs).to.equal(true);
    });
});
