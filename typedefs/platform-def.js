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
        getPlatform(_id: String!): Platform
        getPlatformByName(name: String!): Platform
        getMarathon(_id: String!): [String]
        getLeaderboardEntries(_id: String!, howMany: Int): [LeaderBoardEntry]
    }
    extend type Mutation {
        createNewPlatform(_id: String!): Platform
        deletePlatform(_id: String!): Boolean
        updatePlatformSettings(_id: String!): Boolean
    }
`;

module.exports = {typeDefs: typeDefs};