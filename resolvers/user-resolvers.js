const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model');

// resolver arguments: (parent, args, context, info)
// See https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
module.exports = {
    Query: {
        getNumber: () => {}
    },
    Mutation: {
        login: (user, _, { dataSources: { users } }) => {
            // check if ID is already stored in users
            // if not, create new user with the ID
        },
        logout: () => {},
        incrementNumber: () => {},
        decrementNumber: () => {}
    }
};
