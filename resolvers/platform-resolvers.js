const ObjectId = require('mongoose').Types.ObjectId;
const Platform = require('../models/platform-model');
const User = require('../models/user-model');
const Quiz = require('../models/quiz-model');
const { DEFAULT_BANNER_IMAGE, DEFAULT_THUMBNAIL } = require('../constants');

module.exports = {
    Query: {
        getMarathon: async (_, {_id}) => {
        },
        getLeaderboardEntries: async (_, {_id, howMany}) => {
        },
        getPlatformHighlights: async (_, { howMany }) => {
            const platforms = await Platform.find().limit(howMany);
            if (!platforms) {
                // no platforms in database
                return null;
            }
            const platformInfos = [];
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i];
                const platformInfo = {
                    _id: platform._id,
                    description: platform.description,
                    favorites: platform.favorites,
                    numQuizzes: platform.quizzes.length,
                    thumbnailImg: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    title: platform.title
                };
                platformInfos.push(platformInfo);
            }
            return platformInfos;
        },
        getPlatformSummary: async (_, { title }, { _id }) => {
            const platform = await Platform.findOne({ title: title });
            if (!platform) return null;
            const quizzes = await Quiz.find({ _id: { $in: platform.quizzes } }).limit(100);  // todo: limit this more intelligently
            const quizzesInfo = [];
            for (let i = 0; i < quizzes.length; i++) {
                const quiz = quizzes[i];
                const quizOwner = await User.findById(quiz.owner);
                const quizInfo = {
                    _id: quiz._id,
                    bannerImg: quiz.bannerImg || DEFAULT_BANNER_IMAGE,
                    createdAt: quiz.createdAt.toString(),
                    description: quiz.description,
                    numQuestions: quiz.questions.length,
                    ownerAvatar: quizOwner.avatar,
                    ownerId: quizOwner._id,
                    ownerUsername: quizOwner.username,
                    platformId: platform._id,
                    platformName: platform.title,
                    platformThumbnail: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    rating: quiz.rating,
                    title: quiz.title
                };
                quizzesInfo.push(quizInfo);
            }

            if (_id) {
                _id = new ObjectId(_id);
            }
            const moderator = Boolean(_id && (_id.equals(platform.owner) || platform.moderators.find(moderator => _id.equals(moderator))));

            const platformInfo = {
                _id: platform._id,
                bannerImg: platform.bannerImg || DEFAULT_BANNER_IMAGE,
                color: platform.color,
                description: platform.description,
                favorites: platform.favorites,
                moderator: moderator,
                numQuizzes: platform.quizzes.length,
                numQuestions: platform.questions.length,
                quizzesInfo: quizzesInfo,
                tags: platform.tags,
                thumbnailImg: platform.thumbnailImg || DEFAULT_THUMBNAIL,
            };
            return platformInfo;
        },
        getPlatformThumbnail: async (_, { title }) => {
            const platform = await Platform.findOne({ title: title });
            if (!platform) return null;
            return platform.thumbnailImg || DEFAULT_THUMBNAIL;
        },
        getPlatformSettings: async (_, { title }, { _id }) => {
            const platform = await Platform.findOne({ title: title });
            if (!platform) return null;
            if (_id) _id = new ObjectId(_id);
            if (!_id || !platform.moderators.find(moderator => _id.equals(moderator))) return null;
            const platformSettings = {
                bannerImg: platform.bannerImg,
                color: platform.color,
                minCreatorPoints: platform.minCreatorPoints,
                onlyModSubmissions: platform.onlyModSubmissions,
                tags: platform.tags,
                thumbnailImg: platform.thumbnailImg,
                title: platform.title
            };
            return platformSettings;
        },
        getPlatformById: async (_, { title }, { _id }) => {
            // todo: use _id to check for moderator status
            const platform = await Platform.findOne({ _id: _id });
            if (!platform) return null;
            const quizzes = await Quiz.find({ _id: { $in: platform.quizzes } }).limit(100);  // todo: limit this more intelligently
            const quizzesInfo = [];
            for (let i = 0; i < quizzes.length; i++) {
                const quiz = quizzes[i];
                const quizOwner = await User.findById(quiz.owner);
                const quizInfo = {
                    _id: quiz._id,
                    bannerImg: quiz.bannerImg || DEFAULT_BANNER_IMAGE,
                    createdAt: quiz.createdAt.toString(),
                    description: quiz.description,
                    numQuestions: quiz.questions.length,
                    ownerAvatar: quizOwner.avatar,
                    ownerId: quizOwner._id,
                    ownerUsername: quizOwner.username,
                    platformId: platform._id,
                    platformName: platform.title,
                    platformThumbnail: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    rating: quiz.rating,
                    title: quiz.title
                };
                quizzesInfo.push(quizInfo);
            }
            const platformInfo = {
                bannerImg: platform.bannerImg || DEFAULT_BANNER_IMAGE,
                description: platform.description,
                favorites: platform.favorites,
                numQuizzes: platform.quizzes.length,
                numQuestions: platform.questions.length,
                quizzesInfo: quizzesInfo,
                thumbnailImg: platform.thumbnailImg || DEFAULT_THUMBNAIL,
            };
            return platformInfo;
        }
    },
    Mutation: {
        createPlatform: async (_, { platform }, { _id }) => {
            if (!_id) {
                // user is not logged in
                return null;
            }
            // verify that platform's name is not taken
            const taken = await Platform.exists({ title: platform.title });
            if (taken) {
                return 'name taken';
            }
            // assume that other inputs are valid; validation should be done on the client side
            platform._id = new ObjectId();
            platform.owner = new ObjectId(_id);
            const result = await Platform.create(platform);
            if (!result) {
                return null;
            }
            const user = await User.findById(_id);
            user.platforms.push(platform._id);
            await user.save();
            return platform._id.toString();
        },
        deletePlatform: async (_, {_id}) => {
        },
        updatePlatformSettings: async (_, { platformSettings }) => {
            const platform = await Platform.findById(platformSettings.platformId);
            if (!platform) return null;
            // platform.title = platformSettings.title;  // disallowed for now
            platform.bannerImg = platformSettings.bannerImg;
            platform.thumbnailImg = platformSettings.thumbnailImg;
            await platform.save();
            return platformSettings;
        }
    }
};