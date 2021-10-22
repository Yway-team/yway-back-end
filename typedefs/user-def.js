const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        _id: String
        googleId: String
        numbers: [Int]
    }
    extend type Query {
        getNumbers(_id: String): [Int]
    }
    extend type Mutation {
        login(idToken: String!): User
        logout: Boolean
        incrementNumber(_id: String!, index: Int!): [Int]
        decrementNumber(_id: String!, index: Int!): [Int]
        appendNumber(_id: String!): [Int]
        deleteNumber(_id: String!, index: Int!): [Int]
    }
`;

module.exports = { typeDefs: typeDefs };
