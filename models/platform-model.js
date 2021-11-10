const { model, Schema, ObjectId } = require('mongoose');

const platformSchema = new Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    owner: {
        type: ObjectId,
        required: true
    },
    moderators: {
        type: [ObjectId],
        required: true,
        default: []
    },
    followers: {
        type: Number,
        required: true,
        default: 0
    },
    bannerImg: {
        type: String,
        required: false
    },
    thumbnailImg: {
        type: Number,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    quizzes: {
        type: [ObjectId],
        required: true,
        default: []
    },
    questions: {
        type: [ObjectId],
        required: true,
        default: []
    },
    tags: {
        type: [String],
        required: true,
        default: []
    },
    color: {
        type: String,
        required: false
    },
    minCreatorPoints: {
        type: Number,
        required: true,
        default: 0
    },
    onlyModSubmissions: {
        type: Boolean,
        required: true
    },
    bannedUsers: {
        type: [ObjectId],
        required: true,
        default: []
    },
    platformMetrics: {
        type: [Number],
        required: false
    },
    leaderboard: {
        type: [Object],
        required: true
    }
}, { timestamps: true });

const Platform = model('Platform', platformSchema);
module.exports = Platform;
