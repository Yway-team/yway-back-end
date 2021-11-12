const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model');
const Platform = require('../models/platform-model');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);
const { MAX_NOTIFICATIONS, MAX_HISTORY } = require('../constants');
const { generateAccessToken } = require('../auth');

const getBasicInfo = (user) => {
    return {
        _id: user._id,
        avatar: user.avatar,
        creatorPoints: user.creatorPoints,
        favorites: user.favorites,
        googleId: user.googleId,
        notifications: user.notifications,
        playPoints: user.playPoints,
        username: user.username
    };
};

module.exports = {
    Query: {
        getCurrentUser: async (_, __, { _id }) => {
            // If a user wants information of other users, use getUserInfo
            const user = await User.findById(_id);
            if (user) {
                return user;
            }
            return null;
        },
        getUserPublicInfo: async (_, { userId }) => {
            const user = await User.findById(userId);
            if (!user) {
                return null;
            }
            const publicInfo = {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                privacySettings: user.privacySettings
            };
            return publicInfo;
        },
        getUserInfo: async (_, { userId }, context) => {
            // Check relation of user's privacy settings to requesting user
            // Return info accordingly
            const user = await User.findById(userId);
            if (!user) {
                return null;
            }

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
                history: user.history,
                quizzes: user.quizzes,
                platforms: user.platforms
            };

            if (context._id === userId) {
                // logged-in user is requesting own info
                return privateInfo;
            }
            switch (user.privacySettings) {
                case 'private':
                    return publicInfo;
                case 'friends':
                    if (context._id && user.friends.includes(context._id)) {
                        // requesting user is logged in and friends with the user
                        return privateInfo;
                    }
                    return publicInfo;
                case 'public':
                    return privateInfo;
            }
        },
        getDraftsInfo: async (_, __, { _id }) => {
            if (!_id) {
                // no user logged in
                return null;
            }
            const user = await User.findById(_id);
            if (!user) {
                // weird situation, probably (hopefully) impossible
                return null;
            }
            const draftsInfo = [];
            // todo: sort by last updated?
            user.drafts.forEach((draft) => {
                const draftInfo = {
                    _id: draft._id,
                    bannerImg: draft.bannerImg,
                    createdAt: draft.createdAt,
                    description: draft.description,
                    numQuestions: draft.questions.length,
                    platformName: draft.platformName,
                    tags: draft.tags,
                    timeToAnswer: draft.timeToAnswer,
                    title: draft.title
                };
                draftsInfo.push(draftInfo);
            })
            return draftsInfo;
        }
    },
    Mutation: {
        login: async (_, { idToken }) => {
            // check if ID is already stored in users
            // if not, create new user with the ID
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: CLIENT_ID
            });
            const {sub: googleId, name, picture} = ticket.getPayload();
            let user = await User.findOne({ googleId: googleId });  // should be null if no document found
            let userId;
            if (user) { userId = user._id; }
            else {
                // new user -> create user document and login.
                userId = new ObjectId();
                const newUser = {
                    _id: userId,
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
            const accessToken = generateAccessToken(userId);
            return {
                _id: userId,
                accessToken: accessToken,
                avatar: user.avatar,
                creatorPoints: user.creatorPoints,
                favorites: user.favorites,
                googleId: user.googleId,
                notifications: user.notifications,
                playPoints: user.playPoints,
                username: user.username
            };
        },
        incrementPoints: async (_, {points: {playPoints, creatorPoints}}, {_id}) => {
            const user = await User.findById(_id);
            if (playPoints) {
                user.playPoints += playPoints;
            }
            if (creatorPoints) {
                user.creatorPoints += creatorPoints;
            }
            await user.save();
            return getBasicInfo(user);
        },
        updateBio: async (_, {bio}, {_id}) => {
            const user = await User.findById(_id);
            user.bio = bio;
            await user.save();
            return getBasicInfo(user);
        },
        updatePrivacySettings: async (_, {privacySettings}, {_id}) => {
            const valid = privacySettings === 'public' || privacySettings === 'private' || privacySettings === 'friends';
            if (!valid) {
                return null;
            }
            const user = await User.findById(_id);
            user.privacySettings = privacySettings;
            await user.save();
            return user.privacySettings;
        },
        updateUsername: async (_, {username}, {_id}) => {
            if (!username) {
                return null;
            }
            const user = await User.findById(_id);
            user.username = username;
            await user.save();
            return getBasicInfo(user);
        },
        addNotification: async (_, {notification}, {_id}) => {
            const timestamp = new Date(notification.timestamp);
            if (timestamp === 'Invalid Date') {
                return false;
            }
            notification.timestamp = timestamp;
            const user = await User.findById(_id);
            const length = user.notifications.push(notification);
            if (length > MAX_NOTIFICATIONS) {
                user.notifications.splice(0, length - MAX_NOTIFICATIONS);
            }
            await user.save();
            return true;
        },
        addHistory: async (_, {history}, {_id}) => {
            const timestamp = new Date(history.timestamp);
            if (timestamp === 'Invalid Date') {
                return false;
            }
            history.timestamp = timestamp;
            const user = await User.findById(_id);
            const length = user.history.push(history);
            if (length > MAX_HISTORY) {
                user.history.splice(0, length - MAX_HISTORY);
            }
            await user.save();
            return true;
        },
        favoritePlatform: async (_, { platformId }, { _id }) => {
            const user = await User.findById(_id);
            platformId = ObjectId(platformId);
            const platform = await Platform.findById(platformId);
            if (!platform) {
                // the platform to be favorited does not exist
                return false;
            }
            if (user.favorites.find(favoritePlatformId => favoritePlatformId.equals(platformId))) {
                // the platform to be favorited is already a favorite
                return false;
            }
            user.favorites.push(platformId);
            platform.favorites += 1;
            await user.save();
            await platform.save();
        },
        unfavoritePlatform: async (_, { platformId }, { _id }) => {
            const user = await User.findById(_id);
            platformId = ObjectId(platformId);
            const platform = await Platform.findById(platformId);
            const favoriteIndex = user.favorites.findIndex(favoritePlatformId => favoritePlatformId.equals(platformId));
            if (favoriteIndex === -1) {
                // the given platform is not favorited by the user
                return false;
            }
            user.favorites.splice(favoriteIndex, 1);
            await user.save();
            if (platform) {
                platform.favorites -= 1;
                await platform.save();
            }
            return true;
        },
        sendFriendRequest: async (_, {senderId, receiverId}) => {

        },
        addFriend: async (_, {_id, friendId}) => {

        },
        removeFriend: async (_, {_id, friendId}) => {

        }
    }
};
