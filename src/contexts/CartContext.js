import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.id === product._id && item.selectedSize === selectedSize
      );

      if (existingItem) {
        return prev.map(item =>
          item.id === product._id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        quantity,
        selectedSize
      }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const createOrder = (orderData) => {
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    const newOrder = {
      ...orderData,
      orderId,
      items: cartItems,
      date: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart,
      createOrder,
      orders 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 