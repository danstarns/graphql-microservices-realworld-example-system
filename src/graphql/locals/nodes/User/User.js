const { GraphQLNode } = require("idio-graphql");
const path = require("path");
const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Fields = require("./Fields/index.js");

const User = new GraphQLNode({
    name: "User",
    typeDefs: path.join(__dirname, "./User.gql"),
    resolvers: { Fields, Query, Mutation }
});

module.exports = User;
