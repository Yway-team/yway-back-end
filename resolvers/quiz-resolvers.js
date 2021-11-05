const ObjectId = require('mongoose').Types.ObjectId;
const Quiz = require('../models/quiz-model');
const Question = require('../models/question-model');
const User = require('../models/user-model');
const { DEFAULT_TIME_TO_ANSWER } = require('../constants');
// const { GraphQLScalarType, Kind } = require('graphql');
//
// const dateScalar = new GraphQLScalarType({
//     name: 'Date',
//     description: 'Date custom scalar type',
//     serialize(value) {
//         return value.getTime(); // Convert outgoing Date to integer for JSON
//     },
//     parseValue(value) {
//         return new Date(value); // Convert incoming integer to Date
//     },
//     parseLiteral(ast) {
//         if (ast.kind === Kind.INT) {
//             return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
//         }
//         return null; // Invalid hard-coded value (not an integer)
//     },
// });

module.exports = {
    Query: {
        getQuiz: async (_, {_id}) => {
            const quiz = await Quiz.findById(_id);
            if (quiz) {
                return quiz;
            }
            return null;
        },
        getQuizInfo: async (_, { quizId }, { _id }) => {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                // the provided quizId does not exist
                return null;
            }
            const quizOwner = await User.findById(quiz.owner);
            if (!quizOwner) {
                // Weird situation - not sure what should happen here. Can ownerless quizzes exist?
                return null;
            }
            // const platform = await Platform.findById(quiz.platform);  // platforms have not yet been implemented
            // When platforms have been implemented, change platformId to platform._id, platformName to platform.title, and platformThumbnail to platform.thumbnailImg.
            const quizInfo = {
                bannerImg: quiz.bannerImg,
                createdAt: quiz.createdAt,
                description: quiz.description,
                numQuestions: quiz.questions.length,
                ownerAvatar: quizOwner.avatar,
                ownerId: quizOwner._id,
                ownerUsername: quizOwner.username,
                platformId: quiz.platform,
                platformName: 'Generic Platform Name',
                platformThumbnail: null,
                rating: quiz.rating,
                title: quiz.title
            };
            return quizInfo;
        },
        getQuizMetrics: async (_, {_id}) => {
        }
    },
    Mutation: {
        createAndPublishQuiz: async (_, { quiz }, { _id }) => {
            // creates a quiz based on the provided input and publish it to the specified platform
            // todo: verify that quiz can be created to the prescribed platform based on rules for submission
            if (!_id || !quiz.platform) {
                // no user is logged in (shouldn't happen) or no platform _id was provided
                return null;
            }
            quiz._id = new ObjectId();
            quiz.owner = new ObjectId(_id);
            if (!quiz.timeToAnswer) {
                // if no time limit provided, set it to the default
                quiz.timeToAnswer = DEFAULT_TIME_TO_ANSWER;
            }
            quiz.attempts = 0;
            quiz.averageScore = 0;
            quiz.rating = 0;
            quiz.ratingCount = 0;

            // Handle questions
            for (let i = 0; i < quiz.questions.length; i++) {
                const { answerOptions, correctAnswer, description } = quiz.questions[i];
                if (!description || answerOptions.length === 0 || !answerOptions.includes(correctAnswer)) {
                    // no answer options provided or no question description provided or correctAnswer is not
                    // one of the answerOptions
                    // todo: add better handling for this - more information
                    // it is planned for this validation to instead occur on the front-end
                    return null;
                }
                const questionId = new ObjectId();
                const question = {
                    _id: questionId,
                    answerOptions: answerOptions,
                    correctAnswer: correctAnswer,
                    description: description,
                    quiz: quiz._id,
                    attemptTotal: 0,
                    correctAttempts: 0,
                    platform: quiz.platform
                };
                quiz.questions[i] = questionId;
                await Question.create(question);
            }
            const result = await Quiz.create(quiz);
            if (!result) {
                return null;
            }
            return quiz;
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