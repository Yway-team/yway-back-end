const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model');
const Platform = require('../models/platform-model');
const Quiz = require('../models/quiz-model');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);
const { MAX_NOTIFICATIONS, MAX_HISTORY } = require('../constants');
const { generateAccessToken } = require('../auth');
const { DEFAULT_BANNER_IMAGE, DEFAULT_AVATAR, DEFAULT_THUMBNAIL, DEFAULT_PROFILE_BANNER } = require('../constants');
const { deleteObject, uploadAvatar } = require('../s3');
const { getImageDataFromURL } = require('../utils');

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
        getUserInfo: async (_, { userId }, { _id }) => {
            // todo: return profile banner image (or DEFAULT_PROFILE_BANNER if not present)
            // Check relation of user's privacy settings to requesting user
            // Return info accordingly
            // todo: return whether the logged in user and the user are friends
            userId = new ObjectId(userId);
            if (_id) _id = new ObjectId(_id);
            const user = await User.findById(userId);
            if (!user) {
                return null;
            }
            
            const friend = Boolean(_id && user.friends.find(friendId => friendId.equals(_id)));
            let friendStatus;
            if (friend) friendStatus = 'friend';
            else if (user.sentFriendRequests.find(receiverId => receiverId.equals(_id))) friendStatus = 'received';
            else if (user.receivedFriendRequests.find(senderId => senderId.equals(_id))) friendStatus = 'sent';
            else friendStatus = 'none';
            const publicInfo = {
                _id: user._id,
                avatar: user.avatar,
                friendStatus: friendStatus,
                privacySettings: user.privacySettings,
                username: user.username
            };
            const privateInfo = {
                _id: user._id,
                achievements: user.achievements,
                avatar: user.avatar,
                bio: user.bio,
                creatorPoints: user.creatorPoints,
                friendStatus: friendStatus,
                friends: user.friends,
                history: user.history,
                moderator: user.moderator,
                platforms: user.platforms,
                playPoints: user.playPoints,
                privacySettings: user.privacySettings,
                quizzes: user.quizzes,
                username: user.username
            };

            if (userId.equals(_id)) {
                // logged-in user is requesting own info
                return privateInfo;
            }
            switch (user.privacySettings) {
                case 'private':
                    return publicInfo;
                case 'friends':
                    if (friend) {
                        // requesting user is logged in and friends with the user
                        return privateInfo;
                    }
                    return publicInfo;
                case 'public':
                    return privateInfo;
            }
        },
        getProfileOverview: async (_, { userId }, { _id }) => {
            if (!userId) return null;
            const user = await User.findById(userId);
            
            // 6 each
            let quizzesInfo = await Quiz.find({ _id: { $in: user.quizzes } }).sort({ updatedAt: 'descending' }).limit(6)
            const quizPlatforms = await Platform.find({ _id: { $in: quizzesInfo.map(quiz => quiz.platform) } });
            const quizOwners = await User.find({ _id: { $in: quizzesInfo.map(quiz => quiz.owner) } });
            quizzesInfo = quizzesInfo.map(quiz => {
                const platformIndex = quizPlatforms.findIndex(platform => quiz.platform.equals(platform._id));
                const platform = quizPlatforms[platformIndex];
                const ownerIndex = quizOwners.findIndex(owner => quiz.owner.equals(owner._id))
                const owner = quizOwners[ownerIndex];
                return {
                    _id: quiz._id,
                    bannerImg: quiz.bannerImg || DEFAULT_BANNER_IMAGE,
                    color: quiz.color,
                    createdAt: quiz.createdAt.toISOString(),
                    description: quiz.description,
                    numQuestions: quiz.questions.length,
                    ownerAvatar: owner.avatar,
                    ownerId: owner._id,
                    ownerUsername: owner.username,
                    platformId: platform._id,
                    platformName: platform.title,
                    platformThumbnail: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    rating: quiz.rating,
                    title: quiz.title
                };
            });
            const platformsInfo = (await Platform.find({ _id: { $in: user.platforms } }).sort({ updatedAt: 'descending' }).limit(6)).map(platform => {
                return {
                    _id: platform._id,
                    description: platform.description,
                    favorites: platform.favorites,
                    numQuizzes: platform.quizzes.length,
                    thumbnailImg: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    title: platform.title
                }
            });
            const friendsInfo = (await User.find( { _id: { $in: user.friends } })).slice(-6).map(friend => {
                return {
                    _id: friend._id,
                    avatar: friend.avatar,
                    username: friend.username
                };
            });
            const achievements = user.achievements.slice(-6);
            const history = user.history.slice(-6);
            const overview = {
                playPoints: user.playPoints,
                creatorPoints: user.creatorPoints,
                achievements: achievements,
                friendsInfo: friendsInfo,
                history: history,
                quizzesInfo: quizzesInfo,
                platformsInfo: platformsInfo
            };

            if (_id === userId) {
                // logged-in user is requesting own info
                return overview;
            }
            if (_id) _id = new ObjectId(_id);
            switch (user.privacySettings) {
                case 'private':
                    return null;
                case 'friends':
                    if (_id && user.friends.find(friendId => friendId.equals(_id))) {
                        // requesting user is logged in and friends with the user
                        return overview;
                    }
                    return null;
                case 'public':
                    return overview;
            }
        },
        getDraft: async (_, { draftId }, { _id }) => {
            if (!_id) {
                // no user logged in
                return null;
            }
            const user = await User.findById(_id);
            if (!user) {
                // shouldn't happen
                return null;
            }

            draftId = new ObjectId(draftId);
            const draft = user.drafts.find(draft => draft._id.equals(draftId));
            if (!draft) {
                return null;
            }
            draft.updatedAt = draft.updatedAt?.toISOString();  // only ?. for backward compatibility
            return draft;
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
                    bannerImg: draft.bannerImg || DEFAULT_BANNER_IMAGE,
                    updatedAt: draft.updatedAt?.toISOString(),  // the ?. is only necessary for backward compatibility
                    description: draft.description,
                    numQuestions: draft.questions.length,
                    platformName: draft.platformName,
                    tags: draft.tags,
                    thumbnailImg: draft.thumbnailImg || DEFAULT_THUMBNAIL,
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
                    bannerImg: quiz.bannerImg || DEFAULT_BANNER_IMAGE,
                    createdAt: quiz.createdAt.toISOString(),
                    description: quiz.description,
                    numQuestions: quiz.questions.length,
                    ownerAvatar: user.avatar,
                    ownerId: quiz.owner,
                    ownerUsername: user.username,
                    platformId: platform._id,
                    platformName: platform.title,
                    platformThumbnail: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    rating: quiz.rating,
                    title: quiz.title
                };
                quizInfos.push(quizInfo);
            }
            quizInfos.sort((q1, q2) => {
                const [t1, t2] = [new Date(q1.createdAt).valueOf(), new Date(q2.createdAt).valueOf()];
                return t2 - t1;  // sort descending
            });
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
                    thumbnailImg: platform.thumbnailImg || DEFAULT_THUMBNAIL,
                    title: platform.title
                };
                platformInfos.push(platformInfo);
            }
            return platformInfos;
        },
        getUserFriendsInfo: async (_, { userId }, { _id }) => {
            userId = new ObjectId(userId);
            if (_id) _id = new ObjectId(_id);
            const user = await User.findById(userId);
            let friendsInfo;
            let friendRequestsInfo;
            if (_id && _id.equals(userId)) {
                // logged in user's own profile; return received friend requests and ignore privacy settings
                const senders = await User.find({ _id: { $in: user.receivedFriendRequests } });
                friendRequestsInfo = user.receivedFriendRequests.map(senderId => {
                    const sender = senders.find(sender => sender._id.equals(senderId));
                    return {
                        _id: senderId,
                        avatar: sender.avatar,
                        username: sender.username
                    };
                });
            }
            if ((_id && _id.equals(userId)) || user.privacySettings === 'public' || (user.privacySettings === 'friends' && user.friends.find(_id))) {
                // logged in user is authorized according to the user's privacy settings
                const friends = await User.find({ _id: { $in: user.friends } });
                friendsInfo = user.friends.map(friendId => {
                    const friend = friends.find(friend => friend._id.equals(friendId));
                    return {
                        _id: friendId,
                        avatar: friend.avatar,
                        username: friend.username
                    };
                });
            }
            return {
                friendsInfo: friendsInfo,
                friendRequestsInfo: friendRequestsInfo
            };
        }
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
            const { sub: googleId, name, picture } = ticket.getPayload();
            let user = await User.findOne({ googleId: googleId });  // should be null if no document found
            let userId;
            if (user) userId = user._id;
            else {
                // new user -> create user document and login.
                // todo: upload picture to S3
                userId = new ObjectId();
                const pictureData = await getImageDataFromURL(picture);
                const avatar = await uploadAvatar(pictureData.toString(), userId);
                const newUser = {
                    _id: userId,
                    googleId: googleId,
                    username: name,
                    avatar: avatar,
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
            favorites = favorites.map(favorite => { return { thumbnailImg: favorite.thumbnailImg || DEFAULT_THUMBNAIL, title: favorite.title }; })
                                 .sort((f1, f2) => {
                                    const [t1, t2] = [f1.title.toLowerCase(), f2.title.toLowerCase()];
                                    if (t1 < t2) return -1;
                                    else if (t1 > t2) return 1;
                                    return 0;
                                });
            user.notifications.forEach(notification => notification.createdAt = notification.createdAt.toISOString());
            return {
                _id: userId,
                accessToken: accessToken,
                avatar: user.avatar || DEFAULT_AVATAR,
                creatorPoints: user.creatorPoints,
                favorites: favorites,
                googleId: user.googleId,
                notifications: user.notifications,
                playPoints: user.playPoints,
                username: user.username
            };
        },
        deleteDraft: async (_, { draftId }, { _id }) => {
            if (!_id) return null;
            const user = await User.findById(_id);
            draftId = new ObjectId(draftId);
            const draftIndex = user.drafts.findIndex(draft => draft._id.equals(draftId));
            if (draftIndex === -1) return null;
            const [draft] = user.drafts.splice(draftIndex, 1);
            
            if (draft.bannerImg) {
                const key = draft.bannerImg.split('/').pop();
                await deleteObject(key);
            }
            if (draft.thumbnailImg) {
                const key = draft.thumbnailImg.split('/').pop();
                await deleteObject(key);
            }
            
            await user.save();
            return true;
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
        incrementCreatorPoints: async (_, { creatorPointsIncrement }, { _id }) => {
            if (!_id) return null;
            const user = await User.findById(_id);
            user.creatorPoints += creatorPointsIncrement;
            await user.save();
            return user.playPoints;
        },
        incrementPlayPoints: async (_, { playPointsIncrement }, { _id }) => {
            if (!_id) return null;
            const user = await User.findById(_id);
            user.playPoints += playPointsIncrement;
            await user.save();
            return user.playPoints;
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
        editProfile: async (_, { username, bio, bannerImgData, avatarData }, { _id }) => {
            if (!username) {
                return null;
            }
            const user = await User.findById(_id);
            user.username = username;
            user.bio = bio;
            if (bannerImgData) {
                // todo
            }
            if (avatarData) {
                user.avatar = await uploadAvatar(avatarData, _id);
            }
            await user.save();
            return {
                username: user.username,
                bio: user.bio,
                avatar: user.avatar
            };
        },
        addNotification: async (_, { userId, notification }) => {
            const createdAt = new Date(notification.createdAt);
            if (createdAt === 'Invalid Date') {
                return false;
            }
            notification.createdAt = createdAt;
            const user = await User.findById(userId);
            const length = user.notifications.unshift(notification);
            if (length > MAX_NOTIFICATIONS) {
                user.notifications.splice(MAX_NOTIFICATIONS, length - MAX_NOTIFICATIONS);
            }
            await user.save();
            return true;
        },
        addHistory: async (_, { history }, { _id }) => {
            const timestamp = new Date(history.timestamp);
            if (timestamp === 'Invalid Date') {
                return false;
            }
            history.timestamp = timestamp;
            const user = await User.findById(_id);
            const length = user.history.unshift(history);
            if (length > MAX_HISTORY) {
                user.history.splice(MAX_HISTORY, length - MAX_HISTORY);
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
            favorites = favorites.map(favorite => { return { thumbnailImg: favorite.thumbnailImg || DEFAULT_THUMBNAIL, title: favorite.title }; })
                                 .sort((f1, f2) => {
                                    const [t1, t2] = [f1.title.toLowerCase(), f2.title.toLowerCase()];
                                    if (t1 < t2) return -1;
                                    else if (t1 > t2) return 1;
                                    return 0;
                                });
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
            favorites = favorites.map(favorite => { return { thumbnailImg: favorite.thumbnailImg || DEFAULT_THUMBNAIL, title: favorite.title }; })
                                 .sort((f1, f2) => {
                                    const [t1, t2] = [f1.title.toLowerCase(), f2.title.toLowerCase()];
                                    if (t1 < t2) return -1;
                                    else if (t1 > t2) return 1;
                                    return 0;
                                });
            return favorites;
        },
        sendFriendRequest: async (_, { receiverId }, { _id }) => {
            if (!_id) return false;
            if (_id === receiverId) return false;
            receiverId = new ObjectId(receiverId);
            const senderId = new ObjectId(_id);
            const receivingUser = await User.findById(receiverId);
            const sendingUser = await User.findById(senderId);
            if (!receivingUser || !sendingUser) return false;
            if (sendingUser.sentFriendRequests.find(id => id.equals(receiverId))) {
                // a friend request is already active from this user
                return false;
            }
            receivingUser.receivedFriendRequests.push(senderId);
            const notification = {
                _id: senderId,
                createdAt: new Date(),
                icon: sendingUser.avatar,
                name: sendingUser.username,
                type: 'friend request',
                unread: true
            }
            const length = receivingUser.notifications.unshift(notification);
            if (length > MAX_NOTIFICATIONS) {
                receivingUser.notifications.splice(MAX_NOTIFICATIONS, length - MAX_NOTIFICATIONS);
            }
            sendingUser.sentFriendRequests.push(receiverId);
            await receivingUser.save();
            await sendingUser.save();
            return true;
        },
        acceptFriendRequest: async (_, { senderId }, { _id }) => {
            // this is called by the user who accepts a friend request
            // todo: possibly abusable, look into that
            if (!_id || !senderId || senderId === _id) return false;
            const userId = new ObjectId(_id);
            senderId = new ObjectId(senderId);
            const user = await User.findById(userId);
            const sender = await User.findById(senderId);
            if (!user || !sender) return false;
            if (!user.friends.find(id => id.equals(senderId))) {
                user.friends.push(senderId);
                const sentIndex = user.sentFriendRequests.findIndex(id => id.equals(senderId));
                if (sentIndex !== -1) user.sentFriendRequests.splice(sentIndex, 1);
                const receivedIndex = user.receivedFriendRequests.findIndex(id => id.equals(senderId));
                if (receivedIndex !== -1) user.sentFriendRequests.splice(receivedIndex, 1);
            }
            if (!sender.friends.find(id => id.equals(userId))) {
                sender.friends.push(userId);
            }

            const userSentIndex = user.sentFriendRequests.findIndex(id => id.equals(senderId));
            if (userSentIndex !== -1) user.sentFriendRequests.splice(userSentIndex, 1);
            const userReceivedIndex = user.receivedFriendRequests.findIndex(id => id.equals(senderId));
            if (userReceivedIndex !== -1) user.receivedFriendRequests.splice(userReceivedIndex, 1);
            
            const senderReceivedIndex = sender.receivedFriendRequests.findIndex(id => id.equals(userId));
            if (senderReceivedIndex !== -1) sender.receivedFriendRequests.splice(senderReceivedIndex, 1);
            const senderSentIndex = sender.sentFriendRequests.findIndex(id => id.equals(userId));
            if (senderSentIndex !== -1) sender.sentFriendRequests.splice(senderSentIndex, 1);
            
            await user.save();
            await sender.save();
            return true;
        },
        declineFriendRequest: async (_, { senderId }, { _id }) => {
            // this is called by the user who declines a friend request
            if (!_id || !senderId || senderId === _id) return false;
            const userId = new ObjectId(_id);
            senderId = new ObjectId(senderId);
            const user = await User.findById(userId);
            const sender = await User.findById(senderId);
            if (!user || !sender) return false;
            const receivedIndex = user.receivedFriendRequests.findIndex(id => id.equals(senderId));
            if (receivedIndex !== -1) user.receivedFriendRequests.splice(receivedIndex, 1);
            const sentIndex = sender.sentFriendRequests.findIndex(id => id.equals(userId));
            if (sentIndex !== -1) sender.sentFriendRequests.splice(sentIndex, 1);
            
            await user.save();
            await sender.save();
            return true;
        },
        removeFriend: async (_, { friendId }, { _id }) => {
            if (!_id) return false;
            const userId = ObjectId(_id);
            friendId = ObjectId(friendId);
            const user = await User.findById(userId);
            if (!user) return false;
            const friend = await User.findById(friendId);
            if (!friend) return false;
            const userIndex = user.friends.findIndex(id => id.equals(friendId));
            const friendIndex = friend.friends.findIndex(id => id.equals(userId));
            if (userIndex !== -1) {
                user.friends.splice(userIndex, 1);
            }
            if (friendIndex !== -1) {
                friend.friends.splice(friendIndex, 1);
            }
            await user.save();
            await friend.save();
            return true;
        },
        setReadNotifications: async (_, { time }, { _id }) => {
            if (!_id) return null;
            time = new Date(time);
            const user = await User.findById(_id);
            user.notifications = user.notifications.map(notification => {
                if (notification.unread && (notification.createdAt.valueOf() <= time.valueOf())) {
                    return {...notification, unread: false};
                }
                return notification;
            });
            await user.save();
            return user.notifications.map(notification => { return { ...notification, createdAt: notification.createdAt.toISOString() }; });
        }
    }
};
