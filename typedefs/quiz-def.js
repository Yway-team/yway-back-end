const {gql} = require('apollo-server');

const typeDefs = gql`
    #    scalar Date
    type Quiz {
        _id: ID!,
        title: String!,
        description: String,
        platform: ID!,
        owner: ID!,
        bannerImg: String!,
        thumbnailImg: String!,
        dateCreated: String!,
        questions: [Question]!,
        rating: Float!,
        ratingCount: Int!,
        averageScore: Float!,
        tags: [String]!,
        shuffleQuestions: Boolean!,
        shuffleAnswers: Boolean!,
        color: String,
        attempts: Int!,
        timeToAnswer: Int!
    }
    type Question{
        platform: ID!,
        quiz: ID!,
        description: String!,
        answerOptions: [String]!,
        correctAnswer: String!,
        percentAnsweredCorrect: Float!,
        correctAttempts: Int!,
        attemptTotal: Int!
    }

    extend type Query {
        getQuiz(_id: ID!): Quiz
        getQuizInfo(_id: ID!): Quiz
        getQuizMetrics(_id: ID!): Quiz
        getQuestion(_id: ID!, questionId: ID!): Question
    }
    extend type Mutation {
        createQuiz(_id: ID!): Quiz
        saveQuizAsDraft(_id: ID!): Quiz
        deleteQuiz(_id: ID!): Boolean
        editPublishedQuiz(_id: ID!): Quiz
        rateQuiz(_id: ID!, rating: Int!): Boolean
    }
`;

module.exports = {typeDefs: typeDefs};