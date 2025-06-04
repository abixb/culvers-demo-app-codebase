// src/graphql/resolvers.ts
import { poolPromise, sql } from '../utils/db';
import { ApolloError } from 'apollo-server-azure-functions'; // ApolloError should be available

// Define an interface for the context object passed to resolvers
interface ResolverContext {
  dbPool: sql.ConnectionPool;
}

// Define the structure of arguments for mutations/queries
interface AttemptAddToCartArgs {
  itemId: string;
}

interface GetMenuItemArgs {
  id: string;
}

// Define the structure of your MenuItem as returned by the database
interface MenuItemFromDB {
  id: string;
  name: string;
  description: string | null;
  stock: number;
}

// Define the structure for our CartItemResponse type
interface CartItemResponse {
  success: boolean;
  message: string;
  menuItem: MenuItemFromDB | null;
}

// Define a more specific type for our Resolvers map
// The `info` argument is also available but often not used in simple resolvers.
interface Resolvers {
  Query: {
    menuItems: (parent: any, args: any, context: ResolverContext, info: any) => Promise<MenuItemFromDB[]>;
    menuItem: (parent: any, args: GetMenuItemArgs, context: ResolverContext, info: any) => Promise<MenuItemFromDB | null>;
  };
  Mutation: {
    attemptAddToCart: (parent: any, args: AttemptAddToCartArgs, context: ResolverContext, info: any) => Promise<CartItemResponse>;
  };
  // If you had resolvers for fields within MenuItem (e.g., a computed field), you'd add them here:
  // MenuItem?: {
  //   fieldName: (parent: MenuItemFromDB, args: any, context: ResolverContext, info: any) => any;
  // };
}


const resolvers: Resolvers = {
  Query: {
    menuItems: async (_parent, _args, context) => { // _parent and _args can be any if not used
      try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, name, description, stock FROM MenuItems');
        return result.recordset as MenuItemFromDB[];
      } catch (err: any) {
        console.error('Error fetching menu items:', err.message);
        throw new ApolloError('Failed to fetch menu items.', 'DATABASE_QUERY_ERROR');
      }
    },
    menuItem: async (_parent, args: GetMenuItemArgs, context) => {
      try {
        const pool = await poolPromise;
        const result = await pool.request()
          .input('itemId', sql.VarChar(50), args.id)
          .query('SELECT id, name, description, stock FROM MenuItems WHERE id = @itemId');
        
        if (result.recordset.length > 0) {
          return result.recordset[0] as MenuItemFromDB;
        }
        return null; 
      } catch (err: any) {
        console.error(`Error fetching menu item with ID ${args.id}:`, err.message);
        throw new ApolloError('Failed to fetch menu item.', 'DATABASE_QUERY_ERROR');
      }
    },
  },
  Mutation: {
    attemptAddToCart: async (_parent, args: AttemptAddToCartArgs, context) => {
      const { itemId } = args;
      const pool = await poolPromise;
      let transaction: sql.Transaction | undefined; 

      try {
        if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
          throw new ApolloError('Invalid item ID provided.', 'BAD_USER_INPUT');
        }

        transaction = new sql.Transaction(pool);
        await transaction.begin();
        console.log(`Transaction started for item ID: ${itemId}`);

        const stockCheckResult = await transaction.request()
          .input('itemId', sql.VarChar(50), itemId)
          .query('SELECT name, description, stock FROM MenuItems WHERE id = @itemId');

        if (stockCheckResult.recordset.length === 0) {
          await transaction.rollback();
          console.log(`Item ${itemId} not found. Transaction rolled back.`);
          return { success: false, message: `Item with ID ${itemId} not found.`, menuItem: null };
        }

        const currentItemData = stockCheckResult.recordset[0] as Omit<MenuItemFromDB, 'id'>;
        const currentStock = currentItemData.stock;
        console.log(`Current stock for ${itemId}: ${currentStock}`);

        if (currentStock > 0) {
          const updateResult = await transaction.request()
            .input('itemId', sql.VarChar(50), itemId)
            .query('UPDATE MenuItems SET stock = stock - 1 WHERE id = @itemId AND stock > 0');

          if (updateResult.rowsAffected[0] > 0) {
            await transaction.commit();
            const updatedStock = currentStock - 1;
            console.log(`Stock for item ${itemId} decremented to ${updatedStock}. Transaction committed.`);
            return {
              success: true,
              message: `${currentItemData.name} added to cart!`,
              menuItem: { id: itemId, ...currentItemData, stock: updatedStock },
            };
          } else {
            await transaction.rollback();
            console.log(`Failed to decrement stock for ${itemId} (rowsAffected was 0), likely became 0 concurrently. Transaction rolled back.`);
            return {
              success: false,
              message: `${currentItemData.name} just went out of stock!`,
              menuItem: { id: itemId, ...currentItemData, stock: currentStock }, 
            };
          }
        } else {
          await transaction.rollback();
          console.log(`Item ${itemId} is already out of stock (stock: ${currentStock}). Transaction rolled back.`);
          return {
            success: false,
            message: `${currentItemData.name} is out of stock.`,
            menuItem: { id: itemId, ...currentItemData, stock: currentStock },
          };
        }
      } catch (err: any) { 
        console.error(`Error in attemptAddToCart for item ${itemId}:`, err.message);
        if (transaction && (transaction as any)._active) { 
          try {
            await transaction.rollback();
            console.log("Transaction rolled back due to error.");
          } catch (rollbackErr: any) {
            console.error("Error rolling back transaction:", rollbackErr.message);
          }
        }
        if (err instanceof ApolloError) {
            throw err;
        }
        throw new ApolloError('An error occurred while processing your request.', 'INTERNAL_SERVER_ERROR');
      }
    },
  },
};

export default resolvers; // export the resolvers
