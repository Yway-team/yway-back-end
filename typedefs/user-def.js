const {gql} = require('apollo-server');

const typeDefs = gql`
    type User {
        _id: String!
        achievements: [Achievement]!
        avatar: String!
        bio: String
        creatorPoints: Int!
        drafts: [Quiz]!
        favorites: [String]!
        friends: [String]!
        googleId: String!
        history: [History]!
        moderator: [String]!
        notifications: [Notification]!
        platforms: [String]!
        playPoints: Int!
        privacySettings: String!
        quizzes: [String]!
        username: String!
    }
    extend type Query {
        getCurrentUser(_id: String!): User
        getUserPublicInfo(userId: String!): UserInfo
        getUserInfo(userId: String!): UserInfo
    }
    extend type Mutation {
        login(idToken: String!): User
        favoritePlatform(_id: String!, platformId: String!): Boolean
        sendFriendRequest(senderId: String!, receiverId: String!): Boolean
        addFriend(_id: String!, friendId: String!): Boolean
        removeFriend(_id: String!, friendId: String!): Boolean
        incrementPoints(points: PointsInput!): User
        updateBio(bio: String!): User
        updatePrivacySettings(privacySettings: String!): User
        updateUsername(username: String!): User
        addNotification(notification: NotificationInput!): Boolean
        addHistory(history: HistoryInput!): Boolean
    }
    type UserInfo {
        _id: String!
        avatar: String!
        privacySettings: String!
        username: String!
        bio: String
        creatorPoints: Int
        friends: [String]
        moderator: [String]
        platforms: [String]
        playPoints: Int
        quizzes: [String]
        achievements: [Achievement]
        history: [History]

    }
    type Quizzes { quizzes: [Quiz] }
    type Platforms { platforms: [Platform] }
    input PointsInput {
        playPoints: Int
        creatorPoints: Int
    }
    input NotificationInput {
        description: String!
        type: String!
        timestamp: String!
    }
    input HistoryInput {
        description: String!
        type: String!
        timestamp: String!
    }
    type Notifications { notifications: [Notification] }
    type Achievements { achievements: [Achievement] }
    type Histories { history: [History] }
    input UpdateQuizInput {
        name: String!
    }
    input UpdatePlatformInput {
        name: String!
    }
    input UpdateNotificationsInput {
        name: String!
    }
    input UpdateAchievementsInput {
        name: String!
    }
    input UpdateHistoryInput {
        name: String!
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
        name: String!
        type: String!
        timestamp: String!
    }
`;

module.exports = {typeDefs: typeDefs};
