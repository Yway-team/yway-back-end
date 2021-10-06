const { MongoDataSource } = require('apollo-datasource-mongodb');

// Mongoose calls happen here.


class Users extends MongoDataSource {
    findUserByGoogleId(googleId) {
        return this.findOne({ googleId: googleId });
    }
    createNewUser(googleId) {
        return this.createNewUser({ googleId: googleId, number: 0 });
    }
}

module.exports = { Users: Users };