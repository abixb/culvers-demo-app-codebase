'use client';

import React, { useState } from 'react';
import MenuItemList from '@/components/MenuItemList';
import CartDisplay from '@/components/CartDisplay';

interface CartItem {
  name: string;
  quantity: number;
}

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [aliceCart, setAliceCart] = useState<CartItem[]>([]);
  const [bobCart, setBobCart] = useState<CartItem[]>([]);
  const [currentUserForAction, setCurrentUserForAction] = useState<'Alice' | 'Bob'>('Alice');

  const handleItemAddedToCart = (itemName: string, success: boolean, message: string) => {
    const fullMessage = `${currentUserForAction} attempting to add ${itemName}: ${message}`;
    console.log(fullMessage);
    setMessages(prev => [...prev.slice(-4), fullMessage]); // Keep last 5 messages

    if (success) {
      const updateCart = (prevCart: CartItem[]) => {
        const existingItemIndex = prevCart.findIndex(cartItem => cartItem.name === itemName);
        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += 1;
          return updatedCart;
        }
        return [...prevCart, { name: itemName, quantity: 1 }];
      };

      if (currentUserForAction === 'Alice') {
        setAliceCart(updateCart);
      } else {
        setBobCart(updateCart);
      }
    }
  };

  return (
    <main className="App container mx-auto p-4">
      <header className="App-header mb-8">
        <h1 className="text-3xl font-bold">The Last Piece - Demo App by Abi</h1>
      </header>

      <div className="text-center mb-6">
        <div className="inline-flex rounded-md shadow-sm mb-4" role="group">
          <button 
              onClick={() => setCurrentUserForAction('Alice')} 
              type="button"
              className={`px-6 py-3 text-sm font-medium border rounded-l-lg 
                          ${currentUserForAction === 'Alice' 
                            ? 'text-white bg-blue-600 border-blue-600 ring-2 ring-blue-300' 
                            : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700'}
                            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white`}
          >
              Simulate Alice's Action
          </button>
          <button 
              onClick={() => setCurrentUserForAction('Bob')} 
              type="button"
              className={`px-6 py-3 text-sm font-medium border rounded-r-lg 
                          ${currentUserForAction === 'Bob' 
                            ? 'text-white bg-red-600 border-red-600 ring-2 ring-red-300' 
                            : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-700 focus:text-red-700'}
                            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-red-500 dark:focus:text-white`}
          >
              Simulate Bob's Action
          </button>
        </div>
        <p className="text-lg font-semibold"><b>Current User for "Add to Cart": <span className={currentUserForAction === 'Alice' ? 'text-blue-600' : 'text-red-600'}>{currentUserForAction}</span></b></p>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-center">Menu</h2>
      <MenuItemList onItemAddedToCart={handleItemAddedToCart} />

      <div className="messages mt-8 p-4 border border-gray-200 rounded-lg shadow-sm max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-3">Activity Log:</h3>
        {messages.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
        {messages.map((msg, index) => (
          <p key={index} 
             className={`text-sm py-1 ${msg.includes('success') || msg.includes('added to cart') ? 'text-green-600' : (msg.includes('out of stock') || msg.includes('Error') || msg.includes('Failed') ? 'text-red-600' : 'text-gray-800')}`}>
            {msg}
          </p>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-around items-start gap-6">
        <CartDisplay cartItems={aliceCart} userName="Alice" />
        <CartDisplay cartItems={bobCart} userName="Bob" />
      </div>
    </main>
  );
}
