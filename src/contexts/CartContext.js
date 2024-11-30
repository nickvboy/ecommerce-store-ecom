import { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../lib/utils';

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

  const createOrder = async (orderData) => {
    try {
      // Format the order data for the API
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const shippingAddress = {
        street: orderData.address,
        city: orderData.city,
        state: orderData.state || 'N/A',
        zipCode: orderData.postalCode,
        country: 'United States'
      };

      // Make the API call to create the order
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: orderData.email,
          customerName: `${orderData.firstName} ${orderData.lastName}`,
          items,
          shippingAddress,
          totalAmount: orderData.total
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const newOrder = await response.json();

      // Format the order for the frontend
      const formattedOrder = {
        orderId: newOrder._id,
        items: cartItems,
        customerName: `${orderData.firstName} ${orderData.lastName}`,
        email: orderData.email,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        status: newOrder.status,
        shippingAddress: newOrder.shippingAddress,
        date: newOrder.createdAt
      };

      setOrders(prev => [...prev, formattedOrder]);
      return formattedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
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