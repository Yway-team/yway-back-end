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
        color: String
        description: String
        favorites: Int
        moderator: Boolean
        numQuizzes: Int
        numQuestions: Int
        quizzesInfo: [QuizInfo]
        tags: [String]
        thumbnailImg: String
        title: String
    }
    type PlatformSettings {
        bannerImg: String
        color: String
        minCreatorPoints: Int
        onlyModSubmissions: Boolean
        tags: [String]
        thumbnailImg: String
        title: String
    }
    type LeaderBoardEntry {
        userId: ID!
        rank: Int!
        points: Int!
    }
    extend type Query {
        getMarathon(_id: ID!): [String]
        getLeaderboardEntries(_id: ID!, howMany: Int): [LeaderBoardEntry]
        getPlatformHighlights(howMany: Int!): [PlatformInfo]
        getPlatformSummary(title: String!): PlatformSummary
        getPlatformThumbnail(title: String!): String
        getPlatformSettings(title: String!): PlatformSettings
        updatePlatformSettings(platformSettings: PlatformSettingsInput!): PlatformSettings
        getPlatformById(_id: String!): PlatformSummary
    }
    extend type Mutation {
        createPlatform(platform: PlatformInput!): String
        deletePlatform(_id: ID!): Boolean
        updatePlatformSettings(_id: ID!): Boolean
    }
    input PlatformSettingsInput {
        platformId: ID
        title: String
        bannerImg: String
        thumbnailImg: String
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