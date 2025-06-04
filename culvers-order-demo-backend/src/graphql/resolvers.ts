// src/graphql/resolvers.ts
import { poolPromise, sql } from '../utils/db';
import { ApolloError } from 'apollo-server-azure-functions';

// Updated ResolverContext:
// Since index.ts now simplifies the context and our resolvers get poolPromise directly from db.ts,
// this context might just contain the 'req' object or be minimal if 'req' isn't used by these resolvers.
// For now, let's define it to potentially hold the request object, making it optional.
interface ResolverContext {
  req?: any; // The request object from Azure Functions via Apollo context, if needed
}

// Argument types (remain the same)
interface AttemptAddToCartArgs {
  itemId: string;
}

interface GetMenuItemArgs {
  id: string;
}

// Database result type (remains the same)
interface MenuItemFromDB {
  id: string;
  name: string;
  description: string | null;
  stock: number;
}

// Mutation response type (remains the same)
interface CartItemResponse {
  success: boolean;
  message: string;
  menuItem: MenuItemFromDB | null;
}

// Revised Resolvers interface to be compatible with Apollo Server
// by adding an index signature.
interface Resolvers {
  Query: {
    menuItems: (parent: any, args: any, context: ResolverContext, info: any) => Promise<MenuItemFromDB[]>;
    menuItem: (parent: any, args: GetMenuItemArgs, context: ResolverContext, info: any) => Promise<MenuItemFromDB | null>;
  };
  Mutation: {
    attemptAddToCart: (parent: any, args: AttemptAddToCartArgs, context: ResolverContext, info: any) => Promise<CartItemResponse>;
  };
  // Adding an index signature allows for other properties Apollo Server might expect
  // or for additional resolver types (e.g., for custom scalars or field resolvers on types)
  [key: string]: any;
}


const resolvers: Resolvers = {
  Query: {
    menuItems: async (_parent, _args, context) => {
      try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, name, description, stock FROM MenuItems');
        
        if (result && result.recordset) {
          // Explicitly create a new plain array of plain objects
          const plainData = JSON.parse(JSON.stringify(result.recordset));
          return plainData as MenuItemFromDB[];
        } else {
          console.error('[RESOLVER] menuItems: Query executed but result.recordset is undefined or null.'); 
          throw new ApolloError('Failed to process database response for menu items.', 'DATABASE_PROCESSING_ERROR');
        }
      } catch (err: any) {
        console.error('[RESOLVER] menuItems: Error! Message:', err.message, 'Stack:', err.stack);
        if (err instanceof ApolloError) {
            throw err;
        }
        throw new ApolloError('Failed to fetch menu items due to an internal error.', 'INTERNAL_SERVER_ERROR');
      }
    },
    menuItem: async (_parent, args: GetMenuItemArgs, context) => {
      try {
        const pool = await poolPromise;
        const result = await pool.request()
          .input('itemId', sql.VarChar(50), args.id)
          .query('SELECT id, name, description, stock FROM MenuItems WHERE id = @itemId');
        
        if (result.recordset.length > 0) {
           // Explicitly create a new plain object
          const plainItem = JSON.parse(JSON.stringify(result.recordset[0]));
          return plainItem as MenuItemFromDB;
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

        const stockCheckResult = await transaction.request()
          .input('itemId', sql.VarChar(50), itemId)
          .query('SELECT name, description, stock FROM MenuItems WHERE id = @itemId');

        if (stockCheckResult.recordset.length === 0) {
          await transaction.rollback();
          return { success: false, message: `Item with ID ${itemId} not found.`, menuItem: null };
        }

        const currentItemData = stockCheckResult.recordset[0] as Omit<MenuItemFromDB, 'id'>;
        const currentStock = currentItemData.stock;

        if (currentStock > 0) {
          const updateResult = await transaction.request()
            .input('itemId', sql.VarChar(50), itemId)
            .query('UPDATE MenuItems SET stock = stock - 1 WHERE id = @itemId AND stock > 0');

          if (updateResult.rowsAffected[0] > 0) {
            await transaction.commit();
            const updatedStock = currentStock - 1;
            // Ensure returned menuItem is also plain
            const plainMenuItem = JSON.parse(JSON.stringify({ id: itemId, ...currentItemData, stock: updatedStock }));
            return {
              success: true,
              message: `${currentItemData.name} added to cart!`,
              menuItem: plainMenuItem,
            };
          } else {
            await transaction.rollback();
            const plainMenuItem = JSON.parse(JSON.stringify({ id: itemId, ...currentItemData, stock: currentStock }));
            return {
              success: false,
              message: `${currentItemData.name} just went out of stock!`,
              menuItem: plainMenuItem, 
            };
          }
        } else {
          await transaction.rollback();
          const plainMenuItem = JSON.parse(JSON.stringify({ id: itemId, ...currentItemData, stock: currentStock }));
          return {
            success: false,
            message: `${currentItemData.name} is out of stock.`,
            menuItem: plainMenuItem,
          };
        }
      } catch (err: any) { 
        console.error(`Error in attemptAddToCart for item ${itemId}:`, err.message);
        if (transaction && (transaction as any)._active) { 
          try {
            await transaction.rollback();
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

export default resolvers;
