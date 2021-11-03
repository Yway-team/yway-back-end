const ObjectId = require('mongoose').Types.ObjectId;
const Platform = require('../models/platform-model');

module.exports = {
    Query: {
        getPlatform: async (_, {_id}) => {
            return null;
        }
    },
    Mutation: {
        createNewPlatform: async (_, {_id}) => {
            return null;
        }
    }
};