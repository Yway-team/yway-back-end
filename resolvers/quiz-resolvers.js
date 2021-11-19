const ObjectId = require('mongoose').Types.ObjectId;
const Quiz = require('../models/quiz-model');
const Question = require('../models/question-model');
const User = require('../models/user-model');
const Platform = require('../models/platform-model');
const { DEFAULT_TIME_TO_ANSWER, MAX_DRAFTS } = require('../constants');
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
            const platform = await Platform.findById(quiz.platform);
            const quizInfo = {
                bannerImg: quiz.bannerImg,
                createdAt: quiz.createdAt.toString(),
                description: quiz.description,
                numQuestions: quiz.questions.length,
                ownerAvatar: quizOwner.avatar,
                ownerId: quizOwner._id,
                ownerUsername: quizOwner.username,
                platformId: platform._id,
                platformName: platform.title,
                platformThumbnail: platform.thumbnailImg ? platform.thumbnailImg : 'https://picsum.photos/1000',  // temporary
                rating: quiz.rating,
                title: quiz.title
            };
            return quizInfo;
        },
        getQuizHighlights: async (_, { howMany }) => {
            const quizzes = await Quiz.find().limit(howMany);
            const quizInfos = [];
            for (let i = 0; i < quizzes.length; i++) {
                const quiz = quizzes[i];
                const quizOwner = await User.findById(quiz.owner);  // there ought to be a faster way to do this - can we get all owners simultaneously?
                if (!quizOwner) {
                    // Weird situation - not sure what should happen here. Can ownerless quizzes exist?
                    return null;
                }
                const platform = await Platform.findById(quiz.platform);
                const quizInfo = {
                    _id: quiz._id,
                    bannerImg: quiz.bannerImg ? quiz.bannerImg : 'https://picsum.photos/1000',  // temporary
                    createdAt: quiz.createdAt.toString(),
                    description: quiz.description,
                    numQuestions: quiz.questions.length,
                    ownerAvatar: quizOwner.avatar,
                    ownerId: quizOwner._id,
                    ownerUsername: quizOwner.username,
                    platformId: platform._id,
                    platformName: platform.title,
                    platformThumbnail: platform.thumbnailImg ? platform.thumbnailImg : 'https://picsum.photos/1000',  // temporary
                    rating: quiz.rating,
                    title: quiz.title
                };
                quizInfos.push(quizInfo);
            }
            return quizInfos;
        },
        getQuizMetrics: async (_, {_id}) => {
        }
    },
    Mutation: {
        createAndPublishQuiz: async (_, { quiz }, { _id }) => {
            // creates a quiz based on the provided input and publish it to the specified platform
            // todo: verify that quiz can be created to the prescribed platform based on rules for submission
            if (!_id || !quiz.platformName) {
                // no user is logged in (shouldn't happen) or no platform name was provided
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
            const platform = await Platform.findOne({ title: quiz.platformName });  // escapes only quotes
            if (!platform) {
                // no platform by that name found
                return null;
            }
            quiz.platform = platform._id;
            delete quiz.platformName;  // platform name is not saved in quiz; its _id is

            const user = await User.findById(_id);
            if (!user) {
                // shouldn't happen
                return null;
            }
            // Handle questions
            for (let i = 0; i < quiz.questions.length; i++) {
                const { answerOptions, correctAnswerIndex, description } = quiz.questions[i];
                if (!description || answerOptions.length === 0 || correctAnswerIndex < 0 || correctAnswerIndex >= answerOptions.length) {
                    // no answer options provided or no question description provided or correctAnswerIndex is not
                    // one of the answerOptions
                    // todo: add better handling for this - more information
                    // it is planned for this validation to instead occur on the front-end
                    return null;
                }
                const questionId = new ObjectId();
                const question = {
                    _id: questionId,
                    answerOptions: answerOptions,
                    correctAnswerIndex: correctAnswerIndex,
                    description: description,
                    quiz: quiz._id,
                    attemptTotal: 0,
                    correctAttempts: 0,
                    platform: platform._id
                };
                quiz.questions[i] = questionId;
                await Question.create(question);
            }
            user.quizzes.push(quiz._id);
            platform.quizzes.push(quiz._id);
            await Quiz.create(quiz);
            await user.save();
            await platform.save();
            return quiz;
        },
        saveQuizAsDraft: async (_, { draft }, { _id }) => {
            // If the draft has an _id, replace the draft with the corresponding _id in the user document
            // else give the draft an _id and add it to the user's drafts
            if (!_id) {
                // user is not logged in
                return null;
            }
            const user = await User.findById(_id);
            if (!user.drafts) {
                user.drafts = []
            }
            if (draft._id) {
                // update the draft with the given _id
                // verify that equals() works properly
                // What if, somehow, there is no match?
                draft._id = new ObjectId(draft._id);
                for (let i = 0; i < user.drafts.length; i++) {
                    if (user.drafts[i]._id.equals(draft._id)) {
                        user.drafts[i] = draft;
                        break;
                    }
                }
            } else {
                // this is a new draft; give it an _id and append it to the user's drafts array
                if (user.drafts.length > MAX_DRAFTS) {
                    return null;
                }
                draft._id = new ObjectId();
                user.drafts.push(draft);
            }
            await user.save();
            return draft._id.toString();
        },
        deleteQuiz: async (_, { quizId }, { _id }) => {
            // deletes the quiz entirely - not the same as removing from platform
            // delete quiz document
            // remove from owner's quizzes
            // remove from platform's quizzes
            // delete quiz questions
            // can only be done by owners and (todo) admins
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                // the quiz already does not exist
                return false;
            }
            const userId = ObjectId(_id);
            if (!quiz.owner.equals(userId)) {
                // the owner is not logged in
                return false;
            }
            const user = await User.findById(userId);
            const platform = await Platform.findById(quiz.platform);

            const userIndex = user.quizzes.findIndex(id => id.equals(quiz._id));
            const platformIndex = platform.quizzes.findIndex(id => id.equals(quiz._id));
            if (userIndex === -1 || platformIndex === -1) {
                // Something has gone horribly wrong. This shouldn't ever happen.
                return false;
            }
            user.quizzes.splice(userIndex, 1);
            platform.quizzes.splice(platformIndex, 1);
            await Quiz.deleteOne({ _id: quizId });
            await user.save();
            await platform.save();
            await Question.deleteMany({ quiz: quizId });
            return true;
        },
        editPublishedQuiz: async (_, {_id}) => {
        },
        rateQuiz: async (_, {_id, rating}) => {
        },
    }
};