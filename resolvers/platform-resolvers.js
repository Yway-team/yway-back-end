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
        }
    },
    Mutation: {
        createNewPlatform: async (_, {_id}) => {
        },
        deletePlatform: async (_, {_id}) => {
        },
        updatePlatformSettings: async (_, {_id}) => {
        }
    }
};