const ObjectId = require('mongoose').Types.ObjectId;
const Platform = require('../models/platform-model');

module.exports = {
    Query: {
        getPlatform: async (_, {_id}) => {
            const platform = await Platform.findById(_id);
            if (platform) {
                return platform;
            }
            return null;
        },
        getPlatformByName: async (_, {platformName}) => {
        },
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
                    thumbnailImg: platform.thumbnailImg,
                    title: platform.title
                };
                platformInfos.push(platformInfo);
            }
            return platformInfos;
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
            return platform._id.toString();
        },
        deletePlatform: async (_, {_id}) => {
        },
        updatePlatformSettings: async (_, {_id}) => {
        }
    }
};