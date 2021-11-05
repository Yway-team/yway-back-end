import { gql } from 'apollo-server';

const typeDefs = gql`
    type Question {
        _id: ID!
        answerOptions: [String!]!
        correctAnswer: String!
        description: String!
        quiz: ID!
        attemptTotal: Int
        correctAttempts: Int
        platform: ID
    }
`;

export const typeDefs = typeDefs;
