const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
require('dotenv').config();  // Loads environment variables from .env into process.env
const { MONGO_URI } = process.env;  // Loads environment variables

const { typeDefs } = require('./typedefs/root-def');
const resolvers = require('./resolvers/root-resolvers');
const User = require('./models/user-model.js');
const Users = require('./datasources/users-datasource.js');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: (() => ({
        users: new Users(User)
    })),
    introspection: true
});

mongoose.connect(MONGO_URI).then(() => {
    server.listen().then(({ url }) => {
        console.log(`Server ready at ${url}`);
    });
}).catch((error) => {
    console.log(error);
});
