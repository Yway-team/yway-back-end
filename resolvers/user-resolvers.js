const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model.js');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);

module.exports = {
    Query: {
        getUser: async (_, { _id }) => {
            // @todo: Verify that the requested user is logged in
            // If a user wants information of other users, use getUserInfo
            const user = await User.findOne({ _id: _id });
            if (user) {
                return user;
            }
            return null;
        },
        getUserPublicInfo: async (_, { _id }) => {

        },
        getUserInfo: async (_, { _id }) => {

        },
        getUserAttributes: async (_, { _id, operations }) => {

        }
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
            let user = await User.findOne({ googleId: googleId });  // should be null if no document found
            if (!user) {
                // new user -> create user document and login.
                const newUser = {
                    _id: new ObjectId(),
                    googleId: googleId,
                    number: 0
                };
                user = new User(newUser);
                await user.save();
            }
            context.googleId = googleId;
            return user;
        },
        logout: async (_, __, context) => {
            context.googleId = null;
        },
        updateUser: async (_, args) => {

        },
        favoritePlatform: async (_, { _id, platformId }) => {

        },
        sendFriendRequest: async (_, { senderId, receiverId }) => {

        },
        addFriend: async (_, { _id, friendId }) => {

        },
        removeFriend: (_, { _id, friendId }) => {

        }
    }
};
