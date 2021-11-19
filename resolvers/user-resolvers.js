const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model');
const Platform = require('../models/platform-model');
const Quiz = require('../models/quiz-model');
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
                    if (context._id && user.friends.find(friendId => friendId.equals(context._id))) {  // todo: this won't work because friends is [ObjectId] and context._id is String
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
                    createdAt: draft.createdAt.toString(),
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
        },
        getUserQuizzesInfo: async (_, { userId }, { _id }) => {
            let getOwnQuizzes = false;  // is the user getting his or her own quizzes?
            const loggedIn = Boolean(_id);
            if (!userId) {
                if (!loggedIn) {
                    return null;
                } else {
                    // get logged-in user's own quiz info
                    getOwnQuizzes = true;
                    userId = _id;
                }
            } else if (_id === userId) {
                getOwnQuizzes = true;
            }
            const user = await User.findById(userId);
            if (!user) {
                // requested user does not exist
                return null;
            }
            if (!getOwnQuizzes) {
                // check permissions
                switch (user.privacySettings) {
                    case 'private':
                        return null;
                    case 'friends':
                        if (!loggedIn || !user.friends.find(friendId => friendId.equals(_id))) {
                            return null;
                        }
                        break;
                    case 'public':
                        break;
                }
            }

            const quizzes = await Quiz.find({ _id: { $in: user.quizzes } });
            if (!quizzes) { return null; }
            const platforms = await Platform.find({ _id: { $in: quizzes.map(quiz => quiz.platform) } });  // may be out of order
            const quizInfos = [];
            for (let i = 0; i < quizzes.length; i++) {
                const quiz = quizzes[i];
                const platform = platforms.find(platform => quiz.platform.equals(platform._id));
                if (!platform) {
                    // something went wrong
                    return null;
                }
                const quizInfo = {
                    _id: quiz._id,
                    bannerImg: quiz.bannerImg || 'https://picsum.photos/1000',  // temporary
                    createdAt: quiz.createdAt.toString(),
                    description: quiz.description,
                    numQuestions: quiz.questions.length,
                    ownerAvatar: user.avatar,
                    ownerId: quiz.owner,
                    ownerUsername: user.username,
                    platformId: platform._id,
                    platformName: platform.title,
                    platformThumbnail: platform.thumbnailImg || 'https://picsum.photos/1000',  // temporary
                    rating: quiz.rating,
                    title: quiz.title
                };
                quizInfos.push(quizInfo);
            }
            return quizInfos;
        },
        getUserPlatformsInfo: async (_, { userId }, { _id }) => {
            let getOwnPlatforms = false;
            const loggedIn = Boolean(_id);
            if (!userId) {
                if (!loggedIn) {
                    return null;
                } else {
                    // get logged-in user's own quiz info
                    getOwnPlatforms = true;
                    userId = _id;
                }
            } else if (_id === userId) {
                getOwnPlatforms = true;
            }

            const user = await User.findById(userId);
            if (!user) {
                // requested user does not exist
                return null;
            }
            if (!getOwnPlatforms) {
                // check permissions
                switch (user.privacySettings) {
                    case 'private':
                        return null;
                    case 'friends':
                        if (!loggedIn || !user.friends.find(friendId => friendId.equals(_id))) {
                            return null;
                        }
                        break;
                    case 'public':
                        break;
                }
            }

            const platforms = await Platform.find({ _id: { $in: user.platforms } });
            if (!platforms) { return null; }
            const platformInfos = [];
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i];
                const platformInfo = {
                    _id: platform._id,
                    description: platform.description,
                    favorites: platform.favorites,
                    numQuizzes: platform.quizzes.length,
                    thumbnailImg: platform.thumbnailImg || 'https://picsum.photos/1000',  // temporary
                    title: platform.title
                };
                platformInfos.push(platformInfo);
            }
            return platformInfos;
        },
        /*getFavorites: async (_, __, { _id }) => {
            if (!id) {
                // user is not logged in
                return null;
            }
            const user = await User.findById(_id);
            if (!user) {
                // no user by that _id (shouldn't happen)
                return null;
            }
            // name, thumbnailImg, _id
            const favoritePlatforms = await Platform.find({ _id: { $in: user.favorites } });
            console.log(favoritePlatforms);
            return favoritePlatforms.map(favorite => { return { thumbnailImg: favorite.thumbnailImg, title: favorite.title }; }).sort();
        }*/
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
            let favorites = await Platform.find({ _id: { $in: user.favorites } });
            favorites = favorites.map(favorite => { return { thumbnailImg: favorite.thumbnailImg || 'https://picsum.photos/1000', title: favorite.title }; }).sort();  // temporary
            return {
                _id: userId,
                accessToken: accessToken,
                avatar: user.avatar,
                creatorPoints: user.creatorPoints,
                favorites: favorites,
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
            if (!_id) {
                return null;
            }
            const user = await User.findById(_id);
            platformId = ObjectId(platformId);
            const platform = await Platform.findById(platformId);
            if (!platform) {
                // the platform to be favorited does not exist
                return null;
            }
            if (user.favorites.find(favoritePlatformId => favoritePlatformId.equals(platformId))) {
                // the platform to be favorited is already a favorite
                return null;
            }
            user.favorites.push(platformId);
            platform.favorites += 1;
            await user.save();
            await platform.save();
            let favorites = await Platform.find({ _id: { $in: user.favorites } });
            favorites = favorites.map(favorite => { return { thumbnailImg: favorite.thumbnailImg || 'https://picsum.photos/1000', title: favorite.title }; }).sort();  // temporary img
            return favorites;
        },
        unfavoritePlatform: async (_, { platformId }, { _id }) => {
            if (!_id) {
                return null;
            }
            const user = await User.findById(_id);
            platformId = ObjectId(platformId);
            const platform = await Platform.findById(platformId);
            const favoriteIndex = user.favorites.findIndex(favoritePlatformId => favoritePlatformId.equals(platformId));
            if (favoriteIndex === -1) {
                // the given platform is not favorited by the user
                return null;
            }
            user.favorites.splice(favoriteIndex, 1);
            await user.save();
            if (platform) {
                platform.favorites -= 1;
                await platform.save();
            }
            let favorites = await Platform.find({ _id: { $in: user.favorites } });
            favorites = favorites.map(favorite => { return { thumbnailImg: favorite.thumbnailImg || 'https://picsum.photos/1000', title: favorite.title }; }).sort();  // temporary img
            return favorites;
        },
        sendFriendRequest: async (_, {senderId, receiverId}) => {

        },
        addFriend: async (_, {_id, friendId}) => {

        },
        removeFriend: async (_, {_id, friendId}) => {

        }
    }
};
