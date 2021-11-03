const { gql } = require('apollo-server');
const userDef = require('./user-def').typeDefs;
const quizDef = require('./quiz-def').typeDefs;
const platformDef = require('./platform-def').typeDefs;

const rootDef = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`;

module.exports = {
    typeDefs: [rootDef, userDef, quizDef, platformDef]
};
