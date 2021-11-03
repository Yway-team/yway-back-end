const { model, Schema } = require('mongoose');

const platformSchema = new Schema({
    owner: {
        type: String,
        required: true
    },
    moderators: {
        type: [String],
        required: true
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
        type: [String],
        required: true
    },
    questions: {
        type: [String],
        required: true
    },
    tags: {
        type: [String],
        required: true
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
        type: [String],
        required: true
    },
    platformMetrics: {
        type: [Number],
        required: true
    },
    leaderboard: {
        type: [Object],
        required: true
    }
});

const Platform = model('Platform', platformSchema);
module.exports = Platform;
