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