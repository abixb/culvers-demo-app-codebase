'use client';

import React from 'react';

interface CartItem {
  name: string;
  quantity: number;
}

interface CartDisplayProps {
  cartItems: CartItem[];
  userName: string;
}

const CartDisplay: React.FC<CartDisplayProps> = ({ cartItems, userName }) => {
  return (
    <div className="cart-display">
      {/* Styling for cart-display will be in globals.css */}
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{userName}'s Cart</h3>
      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {cartItems.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">
              {item.name} (Quantity: {item.quantity})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartDisplay; 