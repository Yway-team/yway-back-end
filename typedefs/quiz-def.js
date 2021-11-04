const {gql} = require('apollo-server');

const typeDefs = gql`
    type Quiz {
        _id: ID!
        attempts: Int!
        averageScore: Float!
        bannerImg: String!
        color: String
        description: String
        owner: ID!
        platform: ID!
        questions: [Question!]!
        rating: Float!
        ratingCount: Int!
        tags: [String]!
        title: String!
        shuffleQuestions: Boolean!
        shuffleAnswers: Boolean!
        thumbnailImg: String!
        timeToAnswer: Int!
    }
    type Question {
        platform: ID!
        quiz: ID!
        description: String!
        answerOptions: [String]!
        correctAnswer: String!
        correctAttempts: Int!
        attemptTotal: Int!
    }
    extend type Query {
        getQuiz(_id: ID!): Quiz
        getQuizInfo(_id: ID!): Quiz
        getQuizMetrics(_id: ID!): Quiz
        getQuestion(questionId: ID!): Question
    }
    extend type Mutation {
        createQuiz(quiz: QuizInput!): Quiz
        saveQuizAsDraft(_id: ID!): Quiz
        deleteQuiz(_id: ID!): Boolean
        editPublishedQuiz(_id: ID!): Quiz
        rateQuiz(_id: ID!, rating: Int!): Boolean
    }
    input QuizInput {
        _id: ID!
        bannerImg: String
        color: String
        description: String
        owner: ID!
        platform: ID
        questions: [QuestionInput!]!
        tags: [String]!
        title: String!
        shuffleQuestions: Boolean
        shuffleAnswers: Boolean
        thumbnailImg: String
        timeToAnswer: Int
    }
    input QuestionInput {
        _id: ID!
        answerOptions: [String!]!
        correctAnswer: String!
        description: String!
        quiz: ID!
    }
`;

module.exports = {typeDefs: typeDefs};
