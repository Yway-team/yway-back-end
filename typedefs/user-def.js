const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        _id: String
        googleId: String
        number: Int
    }
    extend type Query {
        getNumber(_id: String): Int
    }
    extend type Mutation {
        login(googleId: String!): User
        logout: Boolean
        incrementNumber(_id: String!): Int
        decrementNumber(_id: String!): Int
    }
`;

module.exports = { typeDefs: typeDefs };
