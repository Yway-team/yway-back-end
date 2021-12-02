const mongoose = require('mongoose');
const { verifyAccessToken } = require('./auth');
const { REQUEST_SIZE_LIMIT } = require('./constants');
require('dotenv').config();  // Loads environment variables from .env into process.env
const { MONGO_URI, BACKEND_PORT, CLIENT_ORIGIN } = process.env;  // Loads environment variables

async function startServer() {
    const { ApolloServer } = require('apollo-server-express');
    const express = require('express');

    const fs = require("fs")
    const https = require("https")
    const http = require("http")
    
    const helmet = require('helmet');
    const mongoSanitize = require('express-mongo-sanitize');
    const xssClean = require('xss-clean');
    
    const { typeDefs } = require('./typedefs/root-def');
    const resolvers = require('./resolvers/root-resolvers');
    const corsPolicy = { origin: [CLIENT_ORIGIN, 'http://yway.app.s3-website.us-east-2.amazonaws.com', 'http://localhost:3000', 'https://www.yway.app', 'https://studio.apollographql.com'], credentials: true };
    
    const configurations = {
        // Note: You may need sudo to run on port 443
        production: { ssl: true, port: 443, hostname: 'api.yway.app' },
        development: { ssl: false, port: 4000, hostname: 'localhost' },
    };

    const environment = process.env.NODE_ENV || 'production';
    const config = configurations[environment];

    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: verifyAccessToken
    });

    await server.start();

    app.use(helmet({ contentSecurityPolicy: false }));  // may be insecure
    app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));  // parses JSON
    app.use(express.urlencoded({ extended: false }));
    app.use(mongoSanitize());
    app.use(xssClean());

    server.applyMiddleware({ app, cors: corsPolicy });

    // Create the HTTPS or HTTP server, per configuration
    let httpServer;
    if (config.ssl) {
      // Assumes certificates are in a .ssl folder off of the package root.
      // Make sure these files are secured.
      httpServer = https.createServer(
        {
            key: fs.readFileSync('/etc/letsencrypt/live/api.yway.app/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/api.yway.app/fullchain.pem'),
            ca: fs.readFileSync('/etc/letsencrypt/live/api.yway.app/chain.pem')
        },
  
        app,
      );
    } else {
      httpServer = http.createServer(app);
    }
  
    await new Promise(resolve =>
      httpServer.listen({ port: config.port }, resolve)
    );

    console.log(
      '🚀 Server ready at',
      `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${
        server.graphqlPath
      }`
    );  

    // app.listen({ port: BACKEND_PORT }, () => { console.log(`Server listening on :${BACKEND_PORT}${server.graphqlPath}`); })
}

mongoose.connect(MONGO_URI)
    .then(startServer)
    .catch(console.error);
