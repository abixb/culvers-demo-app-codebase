import resolvers from './resolvers';

const begin = jest.fn();
const commit = jest.fn();
const rollback = jest.fn();
const query = jest.fn();
const request: any = { input: jest.fn(() => request), query };

jest.mock('../utils/db', () => ({
  poolPromise: Promise.resolve({}),
  sql: {
    Transaction: jest.fn(() => ({ begin, commit, rollback, request: () => request })),
    VarChar: jest.fn()
  }
}));

beforeEach(() => {
  begin.mockReset();
  commit.mockReset();
  rollback.mockReset();
  query.mockReset();
  request.input.mockReturnValue(request);
});

test('attemptAddToCart success', async () => {
  query
    .mockResolvedValueOnce({ recordset: [{ name: 'Onion', description: '', stock: 1 }] })
    .mockResolvedValueOnce({ rowsAffected: [1] });
  const result = await resolvers.Mutation.attemptAddToCart({}, { itemId: 'onion' }, {} as any, {} as any);
  expect(commit).toHaveBeenCalled();
  expect(result.success).toBe(true);
  expect(result.menuItem?.stock).toBe(0);
});

test('attemptAddToCart just went out', async () => {
  query
    .mockResolvedValueOnce({ recordset: [{ name: 'Onion', description: '', stock: 1 }] })
    .mockResolvedValueOnce({ rowsAffected: [0] });
  const result = await resolvers.Mutation.attemptAddToCart({}, { itemId: 'onion' }, {} as any, {} as any);
  expect(rollback).toHaveBeenCalled();
  expect(result.success).toBe(false);
});

test('attemptAddToCart item not found', async () => {
  query.mockResolvedValueOnce({ recordset: [] });
  const result = await resolvers.Mutation.attemptAddToCart({}, { itemId: 'missing' }, {} as any, {} as any);
  expect(rollback).toHaveBeenCalled();
  expect(result.success).toBe(false);
});
