const { gql } = require('apollo-server');

const typeDefs = gql`
    type Platform {
        _id: ID!
        owner: ID!
        moderators: [ID]!
        favorites: Int!
        bannerImg: String
        thumbnailImg: String
        title: String!
        description: String
        quizzes: [ID]!
        questions: [ID]!
        tags: [String]!
        color: String
        minCreatorPoints: Int!
        onlyModSubmissions: Boolean!
        bannedUsers: [ID]!
        platformMetrics: [Int]
        leaderboard: [LeaderBoardEntry]!
    }
    type PlatformInfo {
        _id: ID!
        description: String
        favorites: Int
        numQuizzes: Int!
        thumbnailImg: String
        title: String!
    }
    type PlatformSummary {
        _id: ID
        bannerImg: String
        description: String
        favorites: Int
        numQuizzes: Int
        numQuestions: Int
        quizzesInfo: [QuizInfo]
        thumbnailImg: String
    }
    type LeaderBoardEntry {
        userId: ID!
        rank: Int!
        points: Int!
    }
    extend type Query {
        getPlatform(_id: ID!): Platform
        getPlatformByName(name: String!): Platform
        getMarathon(_id: ID!): [String]
        getLeaderboardEntries(_id: ID!, howMany: Int): [LeaderBoardEntry]
        getPlatformHighlights(howMany: Int!): [PlatformInfo]
        getPlatformSummary(title: String!): PlatformSummary
        getPlatformById(_id: String!): PlatformById
    }
    extend type Mutation {
        createPlatform(platform: PlatformInput!): String
        deletePlatform(_id: ID!): Boolean
        updatePlatformSettings(_id: ID!): Boolean
    }
    input PlatformInput {
        bannerImg: String
        color: String
        description: String
        minCreatorPoints: Int
        onlyModSubmissions: Boolean
        thumbnailImg: String
        tags: [String]
        title: String!
    }
`;

module.exports = {typeDefs: typeDefs};