const { model, Schema, ObjectId } = require('mongoose');

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        }
    }
);

const User = model('User', userSchema);
module.exports = User;
