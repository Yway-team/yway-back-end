const { gql } = require('apollo-server');

const typeDefs = gql`
    type SearchResults {
        platforms: [PlatformInfo]
        quizzes: [QuizInfo]
        users: [UserInfo]
        tags: [String]
    }

    extend type Query {
        search(searchString: String!, filter: String, skip: Int): SearchResults
        searchPlatformTitles(searchString: String!): [String]
    }
`;

module.exports = { typeDefs: typeDefs };
