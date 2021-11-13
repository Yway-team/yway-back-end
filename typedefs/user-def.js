const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        _id: ID!
        achievements: [Achievement]!
        avatar: String!
        bio: String
        creatorPoints: Int!
        drafts: [Draft]!
        favorites: [ID]!
        friends: [ID]!
        googleId: ID!
        history: [History]!
        moderator: [ID]!
        notifications: [Notification]!
        platforms: [ID]!
        playPoints: Int!
        privacySettings: String!
        quizzes: [ID]!
        username: String!
    }
    extend type Query {
        getCurrentUser(_id: ID!): User
        getUserPublicInfo(userId: ID!): UserInfo
        getUserInfo(userId: ID!): UserInfo
        getDraftsInfo: [DraftInfo]
        getFavorites: [FavoriteInfo]
    }
    extend type Mutation {
        login(idToken: String!): LoginInfo
        favoritePlatform(platformId: ID!): [FavoriteInfo!]
        unfavoritePlatform(platformId: ID!): [FavoriteInfo!]
        sendFriendRequest(senderId: ID!, receiverId: ID!): Boolean
        addFriend(_id: ID!, friendId: ID!): Boolean
        removeFriend(_id: ID!, friendId: ID!): Boolean
        incrementPoints(points: PointsInput!): User
        updateBio(bio: String!): User
        updatePrivacySettings(privacySettings: String!): String
        updateUsername(username: String!): User
        addNotification(notification: NotificationInput!): Boolean
        addHistory(history: HistoryInput!): Boolean
    }
    type UserInfo {
        _id: ID!
        avatar: String!
        privacySettings: String!
        username: String!
        bio: String
        creatorPoints: Int
        friends: [ID]
        moderator: [ID]
        platforms: [ID]
        playPoints: Int
        quizzes: [ID]
        achievements: [Achievement]
        history: [History]
    }
    type DraftInfo {
        _id: ID
        bannerImg: String
        createdAt: String
        description: String
        numQuestions: Int
        platformName: String
        tags: [String]
        timeToAnswer: Int
        title: String
    }
    type LoginInfo {
        _id: ID!
        accessToken: String!
        avatar: String
        creatorPoints: Int!
        favorites: [FavoriteInfo!]
        googleId: String
        notifications: [Notification]
        playPoints: Int!
        username: String!
    }
    type FavoriteInfo {
        thumbnailImg: String
        title: String
    }
    input PointsInput {
        playPoints: Int
        creatorPoints: Int
    }
    input NotificationInput {
        description: String!
        timestamp: String!
        type: String!
    }
    input HistoryInput {
        description: String!
        timestamp: String!
        type: String!
    }
    type Achievement {
        creatorPointValue: Int
        description: String!
        playPointValue: Int
        timestamp: String!
        type: String!
    }
    type History {
        description: String!
        timestamp: String!
        type: String!
    }
    type Notification {
        description: String!
        timestamp: String!  # Should this be createdAt?
        type: String!
    }
`;

module.exports = {typeDefs: typeDefs};
