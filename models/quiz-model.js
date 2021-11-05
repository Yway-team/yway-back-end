const { model, Schema, ObjectId } = require('mongoose');

const quizSchema = new Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    platform: {
        type: ObjectId,
        required: false
    },
    owner: {
        type: ObjectId,
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
}, { timestamps: true });

const Quiz = model('Quiz', quizSchema);
module.exports = Quiz;
