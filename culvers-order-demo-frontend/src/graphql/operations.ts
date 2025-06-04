import { gql } from '@apollo/client';

export const GET_MENU_ITEMS = gql`
  query GetMenuItems {
    menuItems {
      id
      name
      description
      stock
    }
  }
`;

export const ATTEMPT_ADD_TO_CART_MUTATION = gql`
  mutation AttemptAddToCart($itemId: ID!) {
    attemptAddToCart(itemId: $itemId) {
      success
      message
      menuItem {
        id
        name
        stock
      }
    }
  }
`;

