import { ApolloServer } from 'apollo-server-azure-functions';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { typeDefs } from '../src/graphql/typeDefs';
import resolvers from '../src/graphql/resolvers';
import { poolPromise } from '../src/utils/db';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    try {
      await poolPromise;
    } catch (error) {
      console.error('Database connection pool failed to initialize or connect:', error);
      throw new Error('Database service is currently unavailable. Please try again later.');
    }
    return { req };
  },
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

export default server.createHandler({
  cors: {
    origin: '*',
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  },
});
