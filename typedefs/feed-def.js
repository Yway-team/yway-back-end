const { gql } = require('apollo-server');

const typeDefs = gql`
    type SearchResults {
        platforms: [PlatformInfo]
        quizzes: [QuizInfo]
        users: [UserInfo]
        tags: [String]
    }

    extend type Query {
        search(searchString: String!, filter: String, skip: SkipInput): SearchResults
        searchPlatformTitles(searchString: String!): [String]
    }
    input SkipInput {
        platforms: Int
        quizzes: Int
        people: Int
    }
`;

module.exports = { typeDefs: typeDefs };
