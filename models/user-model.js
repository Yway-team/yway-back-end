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
        type: [Object],
        required: true
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
    }
}, { timestamps: true });

const User = model('User', userSchema);
module.exports = User;
