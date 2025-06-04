import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// IMPORTANT: Replace with your actual local Azure Function GraphQL endpoint URL
// Check your `func start` output. It's likely http://localhost:7071/api/graphql
const GRAPHQL_ENDPOINT = 'http://localhost:7071/api/graphql'; 

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  fetchOptions: { method: 'POST' },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

