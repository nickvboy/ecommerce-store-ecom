import { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../lib/utils';
import { useUser } from './UserContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart && savedCart !== 'undefined' ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error parsing cart data:', error);
      return [];
    }
  });
  const [orders, setOrders] = useState([]);
  const { user } = useUser();

  // Save cart to localStorage whenever it changes
  const updateCartAndStorage = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    updateCartAndStorage(prev => {
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
    updateCartAndStorage(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    updateCartAndStorage([]);
  };

  const createOrder = async (orderData) => {
    // Prevent guest users from creating orders
    if (user.isGuest) {
      throw new Error('Please sign in or create an account to complete your order');
    }

    try {
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.selectedSize
      }));

      const shippingAddress = {
        street: orderData.address,
        city: orderData.city,
        state: orderData.state || 'N/A',
        zipCode: orderData.postalCode,
        country: 'United States'
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
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
      clearCart(); // Clear the cart after successful order
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