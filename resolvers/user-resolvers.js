
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user-model.js');
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID } = process.env;
const client = new OAuth2Client(CLIENT_ID);

// resolver arguments: (parent, args, context, info)
// See https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
module.exports = {
    Query: {
        getNumbers: async(_, {_id}) => {
            const id = ObjectId(_id);
            const user = await User.findById(id);
            if (user) {
                return user.numbers;
            }
            return null;
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
        logout: () => {},
        incrementNumber: async(_, { _id, index }) => {
            const id = ObjectId(_id);
            const user = await User.findById(id);
            user.numbers[index]++;
            await user.save();
            return user.numbers;
        },
        decrementNumber: async(_, { _id, index }) => {
            const id = ObjectId(_id);
            const user = await User.findById(id);
            user.numbers[index]--;
            await user.save();
            return user.numbers;
        },
        appendNumber: async (_, { _id }) => {
            _id = ObjectId(_id);
            const user = await User.findById(_id);
            if (user) {
                user.numbers.push(0);
                await user.save();
                return user.numbers;
            }
            return null;
        },
        deleteNumber: async (_, { _id, index }) => {
            _id = ObjectId(_id);
            const user = await User.findById(_id);
            if (user) {
                if (user.numbers.length === 0) {
                    return user.numbers;
                } else {
                    user.numbers.splice(index, 1);
                    await user.save();
                    return user.numbers;
                }
            }
            return null;
        }
    }
};
