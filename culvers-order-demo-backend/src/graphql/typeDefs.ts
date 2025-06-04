    // src/graphql/typeDefs.ts
    import { gql } from 'apollo-server-azure-functions';

    export const typeDefs = gql`
      type MenuItem {
        id: ID!
        name: String!
        description: String
        stock: Int!
      }

      # To provide a structured response for the attemptAddToCart mutation
      type CartItemResponse {
        success: Boolean!
        message: String
        menuItem: MenuItem # The item affected, null if out of stock or error
      }

      type Query {
        # Fetches all available menu items
        menuItems: [MenuItem!]!

        # Fetches a single menu item by its ID (optional for this demo, but good practice)
        menuItem(id: ID!): MenuItem
      }

      type Mutation {
        # Simulates adding an item to a cart by checking and decrementing stock.
        # Returns a response indicating success or failure.
        attemptAddToCart(itemId: ID!): CartItemResponse!
      }
    `;
    