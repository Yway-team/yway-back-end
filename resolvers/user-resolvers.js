const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model.js');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);

module.exports = {
    UserInfo: {
        __resolveType(obj) {
            // Only UserPrivateInfo has playPoints
            if (obj.playPoints) {
                return 'UserPrivateInfo';
            }
            return 'UserPublicInfo';
        }
    },
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
            return {
                _id: user._id,
                googleId: user.googleId,
                username: user.username,
                avatar: user.avatar,
                playPoints: user.playPoints,
                creatorPoints: user.creatorPoints,
                favorites: user.favorites,
                notifications: user.notifications
            };
        },
        logout: async (_, __, context) => {
            context.googleId = null;
        },
        incrementPoints: async (_, { points: { playPoints, creatorPoints } }, { _id }) => {
            const user = await User.findById(_id);
            if (playPoints) {
                user.playPoints += playPoints;
            }
            if (creatorPoints) {
                user.creatorPoints += creatorPoints;
            }
            await user.save();
            return {
                _id: user._id,
                googleId: user.googleId,
                username: user.username,
                avatar: user.avatar,
                playPoints: user.playPoints,
                creatorPoints: user.creatorPoints,
                favorites: user.favorites,
                notifications: user.notifications
            };
        },
        updateBio: async (_, { bio }, { _id }) => {
            const user = await User.findById(_id);
            user.bio = bio;
            await user.save();
            return {
                _id: user._id,
                googleId: user.googleId,
                username: user.username,
                avatar: user.avatar,
                playPoints: user.playPoints,
                creatorPoints: user.creatorPoints,
                favorites: user.favorites,
                notifications: user.notifications
            };
        },
        updateUser: async (_, { _id, updates }) => {
            const user = await User.findById(_id);
            if (!user) {
                return null;
            }
            if (updates.quizzes) {
                user.quizzes.push(...updates.quizzes);
            }
            if (updates.platforms) {
                user.platforms.push(...updates.platforms);
            }
            if (updates.playPoints) {
                user.playPoints += updates.playPoints;
            }
            if (updates.creatorPoints) {
                user.creatorPoints += updates.creatorPoints;
            }
            if (updates.notifications) {
                user.notifications.push(...updates.notifications);
            }
            if (updates.achievements) {
                user.achievements.push(...updates.achievements);
            }
            if (updates.history) {
                user.history.push(...updates.history);
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
