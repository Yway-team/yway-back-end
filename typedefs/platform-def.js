const {gql} = require('apollo-server');

const typeDefs = gql`
    type Platform {
        _id: ID!
        owner: ID!,
        moderators: [ID]!,
        followers: Int!,
        bannerImg: String,
        thumbnailImg: String,
        title: String!,
        description: String,
        quizzes: [ID]!,
        questions: [ID]!,
        tags: [String]!,
        color: String,
        minCreatorPoints: Int!,
        onlyModSubmissions: Boolean!,
        bannedUsers: [ID]!,
        platformMetrics: [Int]!,
        leaderboard: [LeaderBoardEntry]!
    }
    type LeaderBoardEntry{
        userId: ID!,
        rank: Int!,
        points: Int!
    }
    extend type Query {
        getPlatform(_id: ID!): Platform
        getPlatformByName(name: String!): Platform
        getMarathon(_id: ID!): [String]
        getLeaderboardEntries(_id: ID!, howMany: Int): [LeaderBoardEntry]
    }
    extend type Mutation {
        createNewPlatform(_id: ID!): Platform
        deletePlatform(_id: ID!): Boolean
        updatePlatformSettings(_id: ID!): Boolean
    }
`;

module.exports = {typeDefs: typeDefs};