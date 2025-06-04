'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../apolloClient'; // Assuming apolloClient.ts is in src/

interface ApolloAppProviderProps {
  children: React.ReactNode;
}

const ApolloAppProvider: React.FC<ApolloAppProviderProps> = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloAppProvider; 