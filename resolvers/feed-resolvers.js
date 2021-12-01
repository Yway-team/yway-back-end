const ObjectId = require('mongoose').Types.ObjectId;
const Platform = require('../models/platform-model');
const Quiz = require('../models/quiz-model');
const User = require('../models/user-model');

function getPlatformResults(platform) {
    return {
        _id: platform._id,
        description: platform.description,
        favorites: platform.favorites,
        numQuizzes: platform.quizzes.length,
        thumbnailImg: platform.thumbnailImg,
        title: platform.title
    }
}

function getQuizResults(quiz, platform, user) {
    return {
        _id: quiz._id,
        bannerImg: quiz.bannerImg,
        color: quiz.color,
        createdAt: quiz.createdAt.toString(),
        description: quiz.description,
        numQuestions: quiz.questions.length,
        ownerAvatar:  user.avatar,
        ownerId: quiz.owner,
        ownerUsername: user.username,
        platformId: quiz.platform,
        platformName: platform.title,
        platformThumbnail: platform.thumbnailImg,
        rating: quiz.rating,
        title: quiz.title
    };
}

function getUserResults(user) {
    return {
        _id: user._id,
        avatar: user.avatar,
        username: user.username
    };
}

module.exports = {
    Query: {
        search: async (_, { searchString, filter }) => {
            const searchResults = {
                platforms: [],
                quizzes: [],
                users: [],
                tags: []
            };

            if (filter === 'platforms') {
                const platforms = await Platform.find({ $text: { $search: searchString } }, { score: { $meta: 'textScore' } })
                                                .sort( { score: { $meta: 'textScore' } }).limit(30);
                searchResults.platforms = platforms.map(getPlatformResults);
            } else if (filter === 'users') {
                const users = await User.find({ $text: { $search: searchString } }, { score: { $meta: 'textScore' } })
                                        .sort( { score: { $meta: 'textScore' } }).limit(30);
                searchResults.users = users.map(getUserResults);
            } else if (filter === 'quizzes') {
                const quizzes = await Quiz.find({ $text: { $search: searchString } }, { score: { $meta: 'textScore' } })
                                          .sort( { score: { $meta: 'textScore' } }).limit(30);
                const owners = await User.find({ _id: { $in: quizzes.map(quiz => quiz.owner) } });
                const quizPlatforms = await Platform.find({ _id: { $in: quizzes.map(quiz => quiz.platform) } });
                searchResults.quizzes = quizzes.map(quiz => {
                    const owner = owners.find(user => user._id.equals(quiz.owner));
                    const platform = quizPlatforms.find(platform => platform._id.equals(quiz.platform));
                    return getQuizResults(quiz, platform, owner);
                });
            } else if (filter === 'tags') {
                
            } else {
                const platforms = await Platform.find({ $text: { $search: searchString } }, { score: { $meta: 'textScore' } })
                                                .sort( { score: { $meta: 'textScore' } }).limit(10);
                searchResults.platforms = platforms.map(getPlatformResults);
                const quizzes = await Quiz.find({ $text: { $search: searchString } }, { score: { $meta: 'textScore' } })
                                          .sort( { score: { $meta: 'textScore' } }).limit(10);
                const owners = await User.find({ _id: { $in: quizzes.map(quiz => quiz.owner) } });
                const quizPlatforms = await Platform.find({ _id: { $in: quizzes.map(quiz => quiz.platform) } });
                searchResults.quizzes = quizzes.map(quiz => {
                    const owner = owners.find(user => user._id.equals(quiz.owner));
                    const platform = quizPlatforms.find(platform => platform._id.equals(quiz.platform));
                    return getQuizResults(quiz, platform, owner);
                });
                const users = await User.find({ $text: { $search: searchString } }, { score: { $meta: 'textScore' } })
                                        .sort( { score: { $meta: 'textScore' } }).limit(10);
                searchResults.users = users.map(getUserResults);
            }
            return searchResults;
        }
    }
};
