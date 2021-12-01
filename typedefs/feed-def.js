const { gql } = require('apollo-server');

const typeDefs = gql`
    type SearchResults {
        platforms: [PlatformInfo]
        quizzes: [QuizInfo]
        users: [UserInfo]
        tags: [String]
    }

    extend type Query {
        search(searchString: String!, filter: String): SearchResults
    }
`;

module.exports = { typeDefs: typeDefs };
