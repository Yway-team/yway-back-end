import { gql } from 'apollo-server';
import { typeDefs as userDef } from './user-def';
import { typeDefs as quizDef } from './quiz-def';
import { typeDefs as platformDef } from './platform-def';

const rootDef = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`;

export const typeDefs = [rootDef, userDef, quizDef, platformDef];
