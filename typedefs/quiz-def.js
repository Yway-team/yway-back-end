const {gql} = require('apollo-server');

const typeDefs = gql`
    type Quiz {
        _id: ID!
        owner: ID!
        platform: ID!
        questions: [ID!]!
        rating: Float!
        ratingCount: Int!
        tags: [String]!
        title: String!
        shuffleQuestions: Boolean!
        shuffleAnswers: Boolean!
        timeToAnswer: Int!
        attempts: Int
        averageScore: Float
        bannerImg: String
        color: String
        description: String
        thumbnailImg: String
    }
    extend type Query {
        getQuiz(_id: ID!): Quiz
        getQuizInfo(_id: ID!): Quiz
        getQuizMetrics(_id: ID!): Quiz
    }
    extend type Mutation {
        createAndPublishQuiz(quiz: QuizInput!): Quiz
        saveQuizAsDraft(_id: ID!): Quiz
        deleteQuiz(_id: ID!): Boolean
        editPublishedQuiz(_id: ID!): Quiz
        rateQuiz(_id: ID!, rating: Int!): Boolean
    }
    input QuizInput {
        questions: [QuestionInput!]!
        title: String!
        shuffleQuestions: Boolean!
        shuffleAnswers: Boolean!
        bannerImg: String
        color: String
        description: String
        platform: ID
        tags: [String]
        thumbnailImg: String
        timeToAnswer: Int
    }
    input QuestionInput {
        answerOptions: [String!]!
        correctAnswer: String!
        description: String!
    }
`;

module.exports = {typeDefs: typeDefs};
