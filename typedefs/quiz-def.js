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
        getTopQuizzes(howMany: Int!): [QuizInfo]
        getQuizInfo(quizId: ID!): QuizInfo
        getQuizEditInfo(quizId: ID!): QuizInfo
        getQuizMetrics(_id: ID!): Quiz
        getQuestionList(quizId: ID!): [ID!]
        getQuestionInfo(questionId: ID!): QuestionInfo
        canPublishToPlatform(title: String!): Boolean
    }
    extend type Mutation {
        createAndPublishQuiz(quiz: QuizInput!): Quiz
        saveQuizAsDraft(draft: DraftInput!): ID
        deleteQuiz(quizId: ID!): Boolean
        updatePublishedQuiz(quizDetails: EditQuizInput!): Quiz
        rateQuiz(quizId: ID!, rating: Int!): Boolean
    }
    type QuizInfo {
        _id: ID!
        bannerImg: String
        color: String
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
        tags: [String]
        thumbnailImg: String
        timeToAnswer: Int
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
        updatedAt: String
        description: String
        platformName: String
        thumbnailImg: String
    }
    input QuizInput {
        _id: ID
        questions: [QuestionInput!]!
        title: String!
        shuffleQuestions: Boolean!
        shuffleAnswers: Boolean!
        bannerImgData: String
        bannerImgName: String
        color: String
        description: String
        platformName: String
        tags: [String]
        thumbnailImgData: String
        thumbnailImgName: String
        timeToAnswer: Int
    }
    input EditQuizInput {
        _id: ID!
        bannerImg: String
        bannerImgData: String
        color: String
        description: String
        tags: [String]
        thumbnailImg: String
        thumbnailImgData: String
        title: String
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
        bannerImgData: String
        bannerImgName: String
        color: String
        updatedAt: String
        description: String
        platformName: String
        thumbnailImgData: String
        thumbnailImgName: String
    }
`;

module.exports = {typeDefs: typeDefs};
