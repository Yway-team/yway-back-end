const { gql } = require('apollo-server');

const typeDefs = gql`
    type Quiz {
        
    }
    extend type Query {
        
    }
    extend type Mutation {
       
    }
    
`;

module.exports = { typeDefs: typeDefs };