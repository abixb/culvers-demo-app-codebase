'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { ATTEMPT_ADD_TO_CART_MUTATION, GET_MENU_ITEMS } from '../graphql/operations';

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  stock: number;
}

interface MenuItemCardProps {
  item: MenuItem;
  onItemAddedToCart: (itemName: string, success: boolean, message: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onItemAddedToCart }) => {
  const [attemptAddToCart, { loading, error: mutationError }] = useMutation(ATTEMPT_ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: GET_MENU_ITEMS }],
    onError: (apolloError) => {
      console.error("Apollo Client Error on mutation:", apolloError);
      onItemAddedToCart(item.name, false, apolloError.message || "Failed to add item due to a client error.");
    }
  });

  const [currentStock, setCurrentStock] = useState(item.stock);

  const handleAddToCart = async () => {
    if (currentStock <= 0) {
        onItemAddedToCart(item.name, false, `${item.name} is out of stock (UI check).`);
        return;
    }
    try {
      const response = await attemptAddToCart({ variables: { itemId: item.id } });
      if (response.data?.attemptAddToCart) {
        const { success, message, menuItem: updatedItem } = response.data.attemptAddToCart;
        onItemAddedToCart(item.name, success, message);
        if (success && updatedItem) {
          setCurrentStock(updatedItem.stock); 
        } else if (!success && updatedItem) {
          setCurrentStock(updatedItem.stock);
        }
      }
    } catch (e: any) {
      console.error("Error during handleAddToCart:", e);
      onItemAddedToCart(item.name, false, e.message || "An unexpected error occurred.");
    }
  };

  useEffect(() => {
    setCurrentStock(item.stock);
  }, [item.stock]);

  return (
    <div 
      className="menu-item-card" 
      // Using Tailwind classes for styling instead of inline styles from original instructions
      // The specific class ".menu-item-card" will be defined in globals.css for complex styles
      style={{ opacity: currentStock <= 0 ? 0.5 : 1 }}
    >
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{item.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{item.description || 'No description available.'}</p>
      <p className="text-md font-medium mb-3">Available Stock: {currentStock}</p>
      <button 
        onClick={handleAddToCart} 
        disabled={loading || currentStock <= 0}
        className="px-4 py-2 bg-yellow-400 text-blue-900 font-bold rounded hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      {mutationError && <p className="text-red-500 text-sm mt-2">Error adding item: {mutationError.message}</p>}
    </div>
  );
};

export default MenuItemCard; 