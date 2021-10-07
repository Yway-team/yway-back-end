
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model.js');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);

// resolver arguments: (parent, args, context, info)
// See https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
module.exports = {
    Query: {
        getNumber: () => { return -1; }
    },
    Mutation: {
        login: async (_, { idToken }, context) => {
            // check if ID is already stored in users
            // if not, create new user with the ID
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: CLIENT_ID
            });
            const { sub: googleId } = ticket.getPayload();
            const user = await User.findUserByGoogleId(googleId);  // should be null if no document found
            if (!user) {
                // new user -> create user document and login.
                user = await User.createNewUser(googleId);
            }
            context.googleId = googleId;
            return user;
        },
        logout: () => {},
        incrementNumber: () => {},
        decrementNumber: () => {}
    }
};