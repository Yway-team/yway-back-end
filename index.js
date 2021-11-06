const mongoose = require('mongoose');
const { verifyAccessToken } = require('./auth');
require('dotenv').config();  // Loads environment variables from .env into process.env
const { MONGO_URI, BACKEND_PORT, CLIENT_ORIGIN } = process.env;  // Loads environment variables

async function startServer() {
    const { ApolloServer } = require('apollo-server-express');
    const express = require('express');
    
    const helmet = require('helmet');
    const mongoSanitize = require('express-mongo-sanitize');
    const xssClean = require('xss-clean');
    
    const { typeDefs } = require('./typedefs/root-def');
    const resolvers = require('./resolvers/root-resolvers');
    const corsPolicy = { origin: [CLIENT_ORIGIN, 'http://yway.app.s3-website.us-east-2.amazonaws.com', 'http://localhost:3000', 'https://studio.apollographql.com'], credentials: true };
    
    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: verifyAccessToken
    });

    await server.start();

    app.use(helmet({ contentSecurityPolicy: false }));  // may be insecure
    app.use(express.json());  // parses JSON
    app.use(express.urlencoded({ extended: false }));
    app.use(mongoSanitize());
    app.use(xssClean());

    server.applyMiddleware({ app, cors: corsPolicy });

    app.listen({ port: BACKEND_PORT }, () => { console.log(`Server listening on :${BACKEND_PORT}${server.graphqlPath}`); })
}

mongoose.connect(MONGO_URI)
    .then(startServer)
    .catch(console.error);
