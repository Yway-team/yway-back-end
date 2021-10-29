const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model.js');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);

// enums
const FRIENDS = 'FRIENDS';
const QUIZZES = 'QUIZZES';
const PLATFORMS = 'PLATFORMS';
const POINTS = 'POINTS';
const NOTIFICATIONS = 'NOTIFICATIONS';
const ACHIEVEMENTS = 'ACHIEVEMENTS';
const HISTORY = 'HISTORY';

module.exports = {
    Query: {
        getUser: async (_, { _id }) => {
            // @todo: Verify that the requested user is logged in
            // If a user wants information of other users, use getUserInfo
            const user = await User.findById(_id);
            if (user) {
                return user;
            }
            return null;
        },
        getUserPublicInfo: async (_, { _id }) => {
            const user = await User.findById(_id);
            if (user) {
                const publicInfo = {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    privacySettings: user.privacySettings
                };
                return publicInfo;
            }
            return null;
        },
        getUserInfo: async (_, { _id }) => {
            // Check relation of user's privacy settings to requesting user
            // Return info accordingly
            const user = await User.findById(_id);
            const publicInfo = {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                privacySettings: user.privacySettings
            };
            const privateInfo = {
                _id: user._id,
                username: user.username,
                bio: user.bio,
                avatar: user.avatar,
                privacySettings: user.privacySettings,
                playPoints: user.playPoints,
                creatorPoints: user.creatorPoints,
                moderator: user.moderator,
                achievements: user.achievements,
                friends: user.friends,
                notifications: user.notifications,
                history: user.history,
                quizzes: user.quizzes,
                platforms: user.platforms
            };
            if (user) {
                switch (user.privacySettings) {
                    case 'private':
                        return publicInfo;
                    case 'friends':
                        // @todo: check if friends
                        // return privateInfo;
                        break;
                    case 'public':
                        return privateInfo;
                    default:
                        throw new ValueError('Invalid privacy settings');  // Should this return null? Or change the user's settings (to private) automatically?
                }
            }
            return null;
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
            const { sub: googleId, name, picture } = ticket.getPayload();
            let user = await User.findOne({ googleId: googleId });  // should be null if no document found
            if (!user) {
                // new user -> create user document and login.
                const newUser = {
                    _id: new ObjectId(),
                    googleId: googleId,
                    username: name,
                    bio: '',
                    avatar: picture,
                    privacySettings: 'private',
                    playPoints: 0,
                    creatorPoints: 0,
                    moderator: [],
                    achievements: [],
                    friends: [],
                    notifications: [],
                    history: [],
                    favorites: [],
                    quizzes: [],
                    drafts: [],
                    platforms: []
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
        updateUser: async (_, { _id, args }) => {
            const user = await User.findById(_id);
            if (!user) {
                return null;
            }
            const attributesToUpdate = args.attributes;
            const updates = {}
            if (attributesToUpdate.includes(QUIZZES)) {
                user.quizzes.push(...args.quizzes);
            }
            if (attributesToUpdate.includes(PLATFORMS)) {
                user.platforms.push(...args.platforms);
            }
            if (attributesToUpdate.includes(POINTS)) {
                user.playPoints += args.points[0];
                user.creatorPoints += args.points[1];
            }
            if (attributesToUpdate.includes(NOTIFICATIONS)) {
                user.notifications.push(...args.notifications);
            }
            if (attributesToUpdate.includes(ACHIEVEMENTS)) {
                user.achievements.push(...args.achievements);
            }
            if (attributesToUpdate.includes(HISTORY)) {
                user.history.push(...args.history);
            }
            await user.save();
            return user;
        },
        favoritePlatform: async (_, { _id, platformId }) => {

        },
        sendFriendRequest: async (_, { senderId, receiverId }) => {

        },
        addFriend: async (_, { _id, friendId }) => {

        },
        removeFriend: async (_, { _id, friendId }) => {

        }
    }
};
