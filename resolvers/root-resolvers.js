const userResolvers = require('./user-resolvers');
const quizResolvers = require('./quiz-resolvers');
const platformResolvers = require('./platform-resolvers');
const feedResolvers = require('./feed-resolvers');

module.exports = [userResolvers, quizResolvers, platformResolvers, feedResolvers];
