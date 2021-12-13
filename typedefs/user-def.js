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
        receivedFriendRequests: [ID]
        sentFriendRequests: [ID]
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
        getProfileOverview(userId: ID!): ProfileOverview
        getDraft(draftId: ID!): Draft
        getDraftsInfo: [DraftInfo]
        getFavorites: [FavoriteInfo]
        getUserQuizzesInfo(userId: ID): [QuizInfo]
        getUserPlatformsInfo(userId: ID): [PlatformInfo]
        getUserFriendsInfo(userId: ID!): FriendsInfo
    }
    extend type Mutation {
        login(idToken: String!): LoginInfo
        deleteDraft(draftId: ID!): Boolean
        favoritePlatform(platformId: ID!): [FavoriteInfo!]
        unfavoritePlatform(platformId: ID!): [FavoriteInfo!]
        sendFriendRequest(receiverId: ID!): Boolean
        acceptFriendRequest(senderId: ID!): Boolean
        declineFriendRequest(senderId: ID!): Boolean
        removeFriend(friendId: ID!): Boolean
        setReadNotifications(time: String!): [Notification]
        incrementPoints(points: PointsInput!): User
        incrementCreatorPoints(creatorPointsIncrement: Int!): Int
        incrementPlayPoints(playPointsIncrement: Int!): Int
        updateBio(bio: String!): User
        updatePrivacySettings(privacySettings: String!): String
        updateUsername(username: String!): User
        editProfile(username: String!, bio: String, bannerImgData: String, avatarData: String): UserInfo
        addNotification(userId: ID!, notification: NotificationInput!): Boolean
        addHistory(history: HistoryInput!): Boolean
        incrementStreak: StreakOutput
        resetStreak: Boolean
        incrementNumQuizzesPlayed: Achievement
    }
    type StreakOutput {
        achievement: Achievement
        playPoints: Int!
        streak: Int!
    }
    type IncrementQuizzesOutput {
        achievement: Achievement
        playPoints: Int!
    }
    type UserInfo {
        _id: ID
        avatar: String
        privacySettings: String
        username: String
        bio: String
        creatorPoints: Int
        friendStatus: String
        friends: [ID]
        moderator: [ID]
        platforms: [ID]
        playPoints: Int
        quizzes: [ID]
        achievements: [Achievement]
        history: [History]
    }
    type FriendsInfo {
        friendsInfo: [UserInfo]
        friendRequestsInfo: [UserInfo]
    }
    type ProfileOverview {
        creatorPoints: Int
        playPoints: Int
        achievements: [Achievement]
        history: [History]
        friendsInfo: [UserInfo]
        quizzesInfo: [QuizInfo]
        platformsInfo: [PlatformInfo]
    }
    type DraftInfo {
        _id: ID
        bannerImg: String
        updatedAt: String
        description: String
        numQuestions: Int
        platformName: String
        tags: [String]
        thumbnailImg: String
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
        _id: String
        createdAt: String
        icon: String
        name: String
        type: String
        unread: Boolean
    }
    input HistoryInput {
        description: String!
        createdAt: String!
        type: String!
    }
    type Achievement {
        count: Int
        creatorPointValue: Int
        description: String!
        icon: String!
        lastEarned: String
        name: String!
        playPointValue: Int
    }
    type History {
        createdAt: String!
        description: String!
        type: String!
    }
    type Notification {
        _id: String
        createdAt: String
        icon: String
        name: String
        type: String
        unread: Boolean
    }
`;

module.exports = {typeDefs: typeDefs};
