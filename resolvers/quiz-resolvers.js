const ObjectId = require('mongoose').Types.ObjectId;
const Quiz = require('../models/quiz-model');
const { GraphQLScalarType, Kind } = require('graphql');

const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
        return new Date(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
        }
        return null; // Invalid hard-coded value (not an integer)
    },
});

module.exports = {
    Query: {
        getQuiz: async (_, {_id}) => {
            const quiz = await Quiz.findById(_id);
            if (quiz) {
                return quiz;
            }
            return null;
        },
        getQuizInfo: async (_, {_id}) => {
        },
        getQuizMetrics: async (_, {_id}) => {
        },
        getQuestion: async (_, {_id, questionId}) => {
        }
    },
    Mutation: {
        createQuiz: async (_, {_id}) => {
        },
        saveQuizAsDraft: async (_, {_id}) => {
        },
        deleteQuiz: async (_, {_id}) => {
        },
        editPublishedQuiz: async (_, {_id}) => {
        },
        rateQuiz: async (_, {_id, rating}) => {
        },
    }
};