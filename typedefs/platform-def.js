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
        leaderboard: [LeaderboardEntry]!
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
        leaderboardEntries: [LeaderboardEntry]
        moderator: Boolean
        numQuizzes: Int
        numQuestions: Int
        quizzesInfo: [QuizInfo]
        tags: [String]
        thumbnailImg: String
        title: String
    }
    type PlatformSettings {
        _id: ID
        bannerImg: String
        color: String
        description: String
        minCreatorPoints: Int
        onlyModSubmissions: Boolean
        tags: [String]
        thumbnailImg: String
        title: String
    }
    type LeaderboardEntry {
        avatar: String
        score: Int
        secondaryScore: Int
        userId: ID
        username: String
    }
    extend type Query {
        getMarathon(_id: ID!): [String]
        getLeaderboardEntries(_id: ID!, howMany: Int): [LeaderboardEntry]
        getPlatformHighlights(howMany: Int!): [PlatformInfo]
        getPlatformSummary(title: String!): PlatformSummary
        getPlatformThumbnail(title: String!): String
        getPlatformSettings(title: String!): PlatformSettings
        getPlatformById(_id: String!): PlatformSummary
    }
    extend type Mutation {
        createPlatform(platform: PlatformInput!): String
        deletePlatform(_id: ID!): Boolean
        updatePlatformSettings(platformSettings: PlatformSettingsInput!): PlatformSettings
        removeQuizFromPlatform(platformId: ID!, quizId: ID!): Boolean
    }
    input PlatformSettingsInput {
        bannerImgData: String
        color: String
        description: String
        minCreatorPoints: Int
        onlyModSubmissions: Boolean
        platformId: ID
        tags: [String]
        thumbnailImgData: String
        title: String
    }
    input PlatformInput {
        bannerImgData: String
        bannerImgName: String
        color: String
        description: String
        minCreatorPoints: Int
        onlyModSubmissions: Boolean
        thumbnailImgData: String
        thumbnailImgName: String
        tags: [String]
        title: String!
    }
`;

module.exports = {typeDefs: typeDefs};