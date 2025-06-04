'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MENU_ITEMS } from '../graphql/operations';
import MenuItemCard from './MenuItemCard';

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  stock: number;
}

interface MenuItemListProps {
  onItemAddedToCart: (itemName: string, success: boolean, message: string) => void;
}

const MenuItemList: React.FC<MenuItemListProps> = ({ onItemAddedToCart }) => {
  const { loading, error, data } = useQuery(GET_MENU_ITEMS);

  if (loading) return <p className="text-center py-4">Loading menu...</p>;
  if (error) {
    const msg = (error.networkError ? 'Network error: ' : '') + error.message;
    console.error('Menu query error:', JSON.stringify(error, null, 2));
    return <p className="text-center py-4 text-red-500">Error loading menu: {msg}</p>;
  }

  return (
    <div className="menu-item-list">
      {/* The h2 for Menu will be in the page.tsx for better layout control */}
      {data && data.menuItems && data.menuItems.length > 0 ? (
        data.menuItems.map((item: MenuItem) => (
          <MenuItemCard key={item.id} item={item} onItemAddedToCart={onItemAddedToCart} />
        ))
      ) : (
        <p className="text-center py-4">No menu items available at the moment.</p>
      )}
    </div>
  );
};

export default MenuItemList;

