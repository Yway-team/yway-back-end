import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    googleId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: true
    },
    privacySettings: {
        type: String,
        required: true
    },
    playPoints: {
        type: Number,
        required: true
    },
    creatorPoints: {
        type: Number,
        required: true
    },
    moderator: {
        type: [String],
        required: true
    },
    achievements: {
        type: [Object],
        required: true
    },
    friends: {
        type: [String],
        required: true
    },
    notifications: {
        type: [Object],
        required: true
    },
    history: {
        type: [Object],
        required: true
    },
    favorites: {
        type: [String],
        required: true
    },
    quizzes: {
        type: [String],
        required: true
    },
    drafts: {
        type: [Object],
        required: true
    },
    platforms: {
        type: [String],
        required: true
    }
}, { timestamps: true });

const User = model('User', userSchema);
export default User;
