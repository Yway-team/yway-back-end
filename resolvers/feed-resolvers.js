const ObjectId = require('mongoose').Types.ObjectId;
const Platform = require('../models/platform-model');
const Quiz = require('../models/quiz-model');
const User = require('../models/user-model');
const { DEFAULT_BANNER_IMAGE, DEFAULT_THUMBNAIL } = require('../constants');

function getPlatformResults(platform) {
    return {
        _id: platform._id,
        description: platform.description,
        favorites: platform.favorites,
        numQuizzes: platform.quizzes.length,
        thumbnailImg: platform.thumbnailImg || DEFAULT_THUMBNAIL,
        title: platform.title
    }
}

function getQuizResults(quiz, platform, user) {
    return {
        _id: quiz._id,
        bannerImg: quiz.bannerImg || DEFAULT_BANNER_IMAGE,
        color: quiz.color,
        createdAt: quiz.createdAt.toISOString(),
        description: quiz.description,
        numQuestions: quiz.questions.length,
        ownerAvatar:  user.avatar,
        ownerId: quiz.owner,
        ownerUsername: user.username,
        platformId: quiz.platform,
        platformName: platform.title,
        platformThumbnail: platform.thumbnailImg || DEFAULT_THUMBNAIL,
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
        search: async (_, { searchString, filter, skip }) => {
            if (filter === 'all' || !skip) skip = 0;
            
            const searchResults = {
                platforms: [],
                quizzes: [],
                users: [],
                tags: []
            };

            const options = {
                readConcern: {
                    level: 'local'  // Why does this have to be 'local'?
                }
            };

            const searchPlatforms = async (howMany, skipAmt) => {
                const platforms = await Platform.aggregate().search({
                    autocomplete: {
                        query: searchString,
                        path: 'title'
                    }
                }).option(options).skip(skipAmt).limit(howMany);
                return platforms.map(getPlatformResults);
            };

            const searchQuizzes = async (howMany, skipAmt) => {
                const quizzes = await Quiz.aggregate().search({
                    autocomplete: {
                        query: searchString,
                        path: 'title'
                    }
                }).option(options).skip(skipAmt).limit(howMany);
                const owners = await User.find({ _id: { $in: quizzes.map(quiz => quiz.owner) } });
                const quizPlatforms = await Platform.find({ _id: { $in: quizzes.map(quiz => quiz.platform) } });
                return quizzes.map(quiz => {
                    const owner = owners.find(user => user._id.equals(quiz.owner));
                    const platform = quizPlatforms.find(platform => platform._id.equals(quiz.platform));
                    return getQuizResults(quiz, platform, owner);
                });
            };

            const searchUsers = async (howMany, skipAmt) => {
                const users = await User.aggregate().search({
                    autocomplete: {
                        query: searchString,
                        path: 'username'
                    }
                }).option(options).skip(skipAmt).limit(howMany);
                return users.map(getUserResults);
            };

            if (filter === 'platforms') {
                searchResults.platforms = await searchPlatforms(30, skip);
            } else if (filter === 'quizzes') {
                searchResults.quizzes = await searchQuizzes(30, skip);
            } else if (filter === 'users') {
                searchResults.users = await searchUsers(30, skip);
            } else if (filter === 'tags') {
                
            } else {
                searchResults.platforms = await searchPlatforms(5, skip);
                searchResults.quizzes = await searchQuizzes(5, skip);
                searchResults.users = await searchUsers(5, skip);
            }
            return searchResults;
        },
        searchPlatformTitles: async (_, { searchString }) => {
            if (!searchString) return [];
            const platforms = await Platform.aggregate().search({
                autocomplete: {
                    query: searchString,
                    path: 'title'
                }
            }).option({ readConcern: { level: 'local' } }).limit(30);
            const titles = platforms.map(platform => platform.title);
            return titles;
        }
    }
};
