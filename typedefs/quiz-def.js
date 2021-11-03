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
        attempts: Int,!
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
        getQuiz(_id: String!): Quiz
        getQuizInfo(_id: String!): Quiz
        getQuizMetrics(_id: String!): Quiz
        getQuestion(_id: String!, questionId: String!): Question
    }
    extend type Mutation {
        createQuiz(_id: String!): Quiz
        saveQuizAsDraft(_id: String!): Quiz
        deleteQuiz(_id: String!): Boolean
        editPublishedQuiz(_id: String!): Quiz
        rateQuiz(_id: String!, rating: Int!): Boolean
    }
`;

module.exports = {typeDefs: typeDefs};