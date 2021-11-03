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
        getUser(_id: String!): User
        getUserPublicInfo(_id: String!): UserPublicInfo
        getUserInfo(_id: String!): UserInfo
        # note that howMany is optional (depends on the operation)
        getUserAttributes(_id: String!, operations: [UserQueryOperation!]!, howMany: [Int]): [UserAttribute]
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
    enum UserQueryOperation {
        FRIENDS
        QUIZZES
        PLATFORMS
        POINTS
        NOTIFICATIONS
        ACHIEVEMENTS
        HISTORY
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
    union UserAttribute = Quizzes | Platforms | Notifications | Achievements | Histories
    union UserInfo = UserPublicInfo | UserPrivateInfo
    input UpdateUserInput {
        attributes: [UserQueryOperation]
        quizzes: [UpdateQuizInput]
        platforms: [UpdatePlatformInput]
        playPoints: Int  # increments values
        creatorPoints: Int  # increments values
        notifications: [UpdateNotificationsInput]
        achievements: [UpdateAchievementsInput]
        history: [UpdateHistoryInput]
    }
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
        name: String!
    }
    type History {
        name: String!
    }
    type Notification {
        name: String!
        type: String!
        timestamp: String!
    }
    # Info public no matter what
    type UserPublicInfo {
        _id: String
        username: String
        avatar: String
        privacySettings: String
    }
    # Info hidden according to privacy settings (also has everything in UserPublicInfo) - visible to users allowed to see it by privacy settings
    type UserPrivateInfo {
        # Note that favorites and drafts are absent
        _id: String
        username: String
        bio: String
        avatar: String
        privacySettings: String
        playPoints: Int
        creatorPoints: Int
        moderator: [String]
        achievements: [Achievement]
        friends: [String]
        notifications: [Notification]
        history: [History]
        quizzes: [String]
        platforms: [String]
    }
`;

module.exports = {typeDefs: typeDefs};
