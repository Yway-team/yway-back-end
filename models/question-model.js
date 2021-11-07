const { model, Schema, ObjectId } = require('mongoose');

const questionSchema = new Schema({
    answerOptions: {
        type: [String],
        required: true
    },
    correctAnswerIndex: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quiz: {
        type: ObjectId,
        required: true
    },
    attemptTotal: {
        type: Number,
        default: 0
    },
    correctAttempts: {
        type: Number,
        default: 0
    },
    platform: {
        type: ObjectId
    }
}, { timestamps: true });

const Question = model('Question', questionSchema);
module.exports = Question;
