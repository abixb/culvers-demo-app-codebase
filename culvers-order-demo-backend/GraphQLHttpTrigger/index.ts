import { ApolloServer } from 'apollo-server-azure-functions';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { typeDefs } from '../src/graphql/typeDefs';
import resolvers from '../src/graphql/resolvers';
import { poolPromise } from '../src/utils/db';

/* ------------------------------------------------------------------ *
 *  1) Build the ApolloServer instance (done once per cold start)
 * ------------------------------------------------------------------ */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Make sure the MSSQL pool is ready for every request
    try {
      await poolPromise;
    } catch (err) {
      console.error(
        'Database connection pool failed to initialise or connect:',
        err,
      );
      throw new Error(
        'Database service is currently unavailable. Please try again later.',
      );
    }
    return { req };
  },
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

/* ------------------------------------------------------------------ *
 *  2) Lazily create & cache the Azure-Functions handler
 *      (createHandler starts Apollo for us)
 * ------------------------------------------------------------------ */
let cachedHandler: ReturnType<typeof server.createHandler> | undefined;

export default function graphqlHandler(context: any, req: any) {
  if (!cachedHandler) {
    cachedHandler = server.createHandler({
      cors: {
        origin: '*',
        methods: 'GET,POST,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true,
      },
    });
  }

  return cachedHandler(context, req);
}
