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

  // Function to fetch latest stock information
  const fetchLatestStock = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      return data.stock;
    } catch (error) {
      console.error('Error fetching stock:', error);
      return null;
    }
  };

  // Save cart to localStorage whenever it changes
  const updateCartAndStorage = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    // Handle case where product is passed as a complete object with quantity
    if (typeof product === 'object' && 'quantity' in product) {
      quantity = product.quantity;
      selectedSize = product.selectedSize;
    }

    updateCartAndStorage(prev => {
      const existingItem = prev.find(item => 
        item.id === (product._id || product.id) && item.selectedSize === selectedSize
      );

      if (existingItem) {
        // If the product has a quantity property, replace the quantity instead of adding to it
        // This means it's coming from the product detail page
        const newQuantity = 'quantity' in product ? quantity : existingItem.quantity + quantity;
        
        return prev.map(item =>
          item.id === (product._id || product.id) && item.selectedSize === selectedSize
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prev, {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        quantity,
        selectedSize,
        stock: product.stock
      }];
    });
  };

  const updateQuantity = async (itemId, selectedSize, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    // Fetch latest stock information
    const latestStock = await fetchLatestStock(itemId);
    if (latestStock === null) {
      alert('Unable to verify stock. Please try again.');
      return;
    }

    updateCartAndStorage(prev => {
      const item = prev.find(item => item.id === itemId && item.selectedSize === selectedSize);
      
      // Update item's stock information with latest data
      if (item) {
        item.stock = latestStock;
      }
      
      // Check if new quantity exceeds stock
      if (item && newQuantity > latestStock) {
        alert(`Sorry, only ${latestStock} units available`);
        return prev.map(cartItem => 
          cartItem.id === itemId && cartItem.selectedSize === selectedSize
            ? { ...cartItem, stock: latestStock }
            : cartItem
        );
      }
      
      return prev.map(item => 
        item.id === itemId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity, stock: latestStock }
          : item
      );
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
      orders,
      updateQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 