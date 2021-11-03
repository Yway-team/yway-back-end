const {gql} = require('apollo-server');

const typeDefs = gql`
    type Quiz {
        _id: String!
    }
    extend type Query {
        getQuiz(_id: String!): Quiz
    }
    extend type Mutation {
        createQuiz(_id: String!): Quiz
    }

`;

module.exports = {typeDefs: typeDefs};