const ObjectId = require('mongoose').Types.ObjectId;
const Quiz = require('../models/quiz-model');

module.exports = {
    Query: {
        getQuiz: async (_, {_id}) => {
            return null;
        }
    },
    Mutation: {
        createQuiz: async (_, {_id}) => {
            return null;
        }
    }
};