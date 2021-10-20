const mongoose = require('mongoose');
require('dotenv').config();  // Loads environment variables from .env into process.env
const { MONGO_URI, BACKEND_PORT, CLIENT_ORIGIN } = process.env;  // Loads environment variables

async function startServer() {
    const { ApolloServer } = require('apollo-server-express');
    const express = require('express');
    
    const cors = require('cors');
    const helmet = require('helmet');
    const mongoSanitize = require('express-mongo-sanitize');
    const xssClean = require('xss-clean');
    
    const { typeDefs } = require('./typedefs/root-def');
    const resolvers = require('./resolvers/root-resolvers');
    
    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    await server.start();

    app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
    app.use(helmet({ contentSecurityPolicy: false }));  // may be insecure
    app.use(express.json());  // parses JSON
    app.use(express.urlencoded({ extended: false }));
    app.use(mongoSanitize());
    app.use(xssClean());

    server.applyMiddleware({ app });

    await new Promise(resolve => app.listen({ port: BACKEND_PORT }, resolve));

    console.log(`🚀 Server ready at http://localhost:${BACKEND_PORT}${server.graphqlPath}`);
}

mongoose.connect(MONGO_URI)
    .then(startServer)
    .catch(console.error);
