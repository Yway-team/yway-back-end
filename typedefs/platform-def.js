const {gql} = require('apollo-server');

const typeDefs = gql`
    type Platform {
        _id: String!
    }
    extend type Query {
        getPlatform(_id: String!): Platform
    }
    extend type Mutation {
        createNewPlatform(_id: String!): Platform
    }

`;

module.exports = {typeDefs: typeDefs};