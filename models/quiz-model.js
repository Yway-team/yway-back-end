const {model, Schema} = require('mongoose');

const quizSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    platform: {
        type: String,
        required: false
    },
    owner: {
        type: String,
        required: true
    },
    bannerImg: {
        type: String,
        required: false
    },
    thumbnailImg: {
        type: String,
        required: false
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now()
    },
    questions: {
        type: [Object],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    ratingCount: {
        type: Number,
        required: true,
        default: 0
    },
    averageScore: {
        type: Number,
        required: true,
        default: 0
    },
    tags: {
        type: [String],
        required: true
    },
    shuffleQuestions: {
        type: Boolean,
        required: true
    },
    shuffleAnswers: {
        type: Boolean,
        required: true
    },
    color: {
        type: String,
        required: false
    },
    attempts: {
        type: Number,
        required: true,
        default: 0
    },
    timeToAnswer: {
        type: Number,
        required: true
    }
});

const Quiz = model('Quiz', quizSchema);
module.exports = Quiz;