const { gql } = require('apollo-server');

const typeDefs = gql`
    type Quiz {
        _id: ID!
        owner: ID!
        platform: ID!
        questions: [ID!]!
        rating: Float!
        ratingCount: Int!
        tags: [String]
        title: String!
        shuffleQuestions: Boolean!
        shuffleAnswers: Boolean!
        timeToAnswer: Int!
        attempts: Int
        averageScore: Float
        bannerImg: String
        color: String
        createdAt: String
        description: String
        thumbnailImg: String
    }
    extend type Query {
        getQuiz(_id: ID!): Quiz
        getQuizHighlights(howMany: Int!): [QuizInfo]
        getQuizInfo(quizId: ID!): QuizInfo
        getQuizMetrics(_id: ID!): Quiz
        getQuestionList(quizId: ID!): [ID!]
        getQuestionInfo(questionId: ID!): QuestionInfo
    }
    extend type Mutation {
        createAndPublishQuiz(quiz: QuizInput!): Quiz
        saveQuizAsDraft(draft: DraftInput!): ID
        deleteQuiz(quizId: ID!): Boolean
        editPublishedQuiz(_id: ID!): Quiz
        rateQuiz(_id: ID!, rating: Int!): Boolean
    }
    type QuizInfo {
        _id: ID!
        bannerImg: String
        createdAt: String!
        description: String
        numQuestions: Int!
        ownerAvatar: String
        ownerId: ID!
        ownerUsername: String!
        platformId: ID!
        platformName: String!
        platformThumbnail: String
        rating: Float!
        title: String!
    }
    type Draft {
        _id: ID
        questions: [Question]
        tags: [String]
        title: String
        shuffleQuestions: Boolean
        shuffleAnswers: Boolean
        timeToAnswer: Int
        bannerImg: String
        color: String
        createdAt: String
        description: String
        platformName: String
        thumbnailImg: String
    }
    input QuizInput {
        questions: [QuestionInput!]!
        title: String!
        shuffleQuestions: Boolean!
        shuffleAnswers: Boolean!
        bannerImgData: String
        color: String
        description: String
        platformName: String
        tags: [String]
        thumbnailImgData: String
        timeToAnswer: Int
    }
    input QuestionInput {
        answerOptions: [String!]!
        correctAnswerIndex: Int!
        description: String!
    }
    input DraftInput {
        _id: String
        questions: [QuestionInput]
        tags: [String]
        title: String
        shuffleQuestions: Boolean
        shuffleAnswers: Boolean
        timeToAnswer: Int
        bannerImg: String
        color: String
        createdAt: String
        description: String
        platformName: String
        thumbnailImg: String
    }
`;

module.exports = {typeDefs: typeDefs};
