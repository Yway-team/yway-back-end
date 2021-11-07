const { gql } = require('apollo-server');

const typeDefs = gql`
    type Question {
        _id: ID!
        answerOptions: [String!]!
        correctAnswerIndex: Int!
        description: String!
        quiz: ID!
        attemptTotal: Int
        correctAttempts: Int
        platform: ID
    }
`;

module.exports = { typeDefs: typeDefs };
