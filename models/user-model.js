const ObjectId = require('mongoose').Types.ObjectId;
const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    googleId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: true
    },
    bannerImg: {
        type: String,
    },
    privacySettings: {
        type: String,
        required: true
    },
    playPoints: {
        type: Number,
        required: true
    },
    creatorPoints: {
        type: Number,
        required: true
    },
    moderator: {
        type: [String],
        required: true
    },
    achievements: {
        type: Object,
        required: true,
        default: {}
    },
    friends: {
        type: [ObjectId],
        required: true,
        default: []
    },
    sentFriendRequests: {
        type: [ObjectId],
        default: []
    },
    receivedFriendRequests: {
        type: [ObjectId],
        default: []
    },
    notifications: {
        type: [Object],
        required: true
    },
    history: {
        type: [Object],
        required: true
    },
    favorites: {
        type: [ObjectId],
        required: true
    },
    quizzes: {
        type: [ObjectId],
        required: true
    },
    drafts: {
        type: [Object],
        required: true
    },
    platforms: {
        type: [ObjectId],
        required: true
    },
    currentStreak: {
        type: Number,
        required: true,
        default: 0
    },
    numPlatformsCreated: {
        type: Number,
        required: true,
        default: 0
    },
    numQuizzesCreated: {
        type: Number,
        required: true,
        default: 0
    },
    numQuizzesPlayed: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

const User = model('User', userSchema);
module.exports = User;
