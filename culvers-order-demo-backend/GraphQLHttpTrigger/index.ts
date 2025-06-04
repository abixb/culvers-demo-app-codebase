// GraphQLHttpTrigger/index.ts
import { ApolloServer } from 'apollo-server-azure-functions';
import { typeDefs } from '../src/graphql/typeDefs'; // Path should be correct if src is at root of compiled output
import resolvers from '../src/graphql/resolvers';   // Path should be correct
import { poolPromise } from '../src/utils/db';      // Only importing poolPromise as sql object is used within db.ts or resolvers

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers, // This still needs to be of a type compatile with what ApolloServer expects.
             // The error you saw might persist if the 'Resolvers' type from resolvers.ts
             // isn't compatible with ApolloServer's expected IResolvers type.
             // We'll address that in resolvers.ts if needed.
  context: async ({ req }) => {
    // Simplified context as recommended.
    // Resolvers are already using poolPromise directly from db.ts.
    // We ensure the pool is ready here before any resolver attempts to use it.
    // This acts as an early check for DB connectivity for each request.
    try {
      await poolPromise; // Await to ensure connection pool is initialized and ready
    } catch (error) {
      console.error("Database connection pool failed to initialize or connect:", error);
      // If the pool itself failed to initialize, this is a critical error.
      // Resolvers attempting to use it will fail.
      // We can throw here to make it explicit, or let resolvers fail individually.
      // For the demo, throwing an error here might be clearer if the DB is down.
      throw new Error("Database service is currently unavailable. Please try again later.");
    }

    return {
      // Pass the original request object if needed by any resolvers (e.g., for headers, auth)
      req,
      // No need to pass dbPool here if resolvers import and use poolPromise directly from db.ts
    };
  },
  // Enable introspection and playground for easier testing, especially in development.
  introspection: process.env.NODE_ENV !== 'production',
  // For Apollo Server v3+, the playground (Apollo Sandbox) is typically enabled by default
  // if introspection is true.
});

// Export the handler for the Azure Function runtime
export default server.createHandler({
  cors: {
    origin: '*', // IMPORTANT: For local dev only. Restrict in production!
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  },
});
