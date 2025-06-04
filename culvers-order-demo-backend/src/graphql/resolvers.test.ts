jest.mock('../utils/db', () => ({
  poolPromise: Promise.resolve({
    request: () => ({
      query: async () => ({ recordset: [] }),
      input: () => ({ query: async () => ({ rowsAffected: [1] }) })
    })
  }),
  sql: {}
}));

import resolvers from './resolvers';

test('dummy test for menuItems resolver existence', () => {
  expect(resolvers.Query.menuItems).toBeDefined();
});

