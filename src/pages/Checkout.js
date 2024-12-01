import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Button } from "../components/ui/button";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, createOrder } = useCart();
  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });

  // Redirect guest users to signup
  useEffect(() => {
    if (user.isGuest) {
      navigate('/signup', { 
        state: { 
          redirectTo: '/checkout',
          message: 'Please create an account or sign in to complete your purchase.' 
        } 
      });
    }
  }, [user, navigate]);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10.00;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check that user is not a guest
    if (user.isGuest) {
      setError('Please create an account or sign in to complete your purchase.');
      navigate('/signup', { 
        state: { 
          redirectTo: '/checkout',
          message: 'Please create an account or sign in to complete your purchase.' 
        } 
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const orderData = {
        ...formData,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total
      };

      const order = await createOrder(orderData);
      navigate('/order-success', { state: { order } });
    } catch (error) {
      setError(error.message || 'Failed to create order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking user status
  if (loading && !cartItems.length) {
    return (
      <div className="min-h-screen bg-100 text-text-100 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-100 text-text-100 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/products" className="text-primary-100 hover:text-primary-200 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // If user is guest, this will render briefly before redirect
  if (user.isGuest) {
    return (
      <div className="min-h-screen bg-100 text-text-100 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-4">You need to be signed in to complete your purchase.</p>
          <Link to="/signup" className="text-primary-100 hover:text-primary-200 transition-colors">
            Create Account or Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-100 text-text-100 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link 
          to="/cart" 
          className="inline-flex items-center text-text-200 hover:text-primary-100 transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          BACK TO CART
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-12 gap-8">
            {/* Left Column - Form */}
            <div className="md:col-span-8">
              <div className="bg-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-medium mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-medium mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-200 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled={true}
                      className="w-full px-4 py-2 bg-100 border border-300 rounded-md 
                               text-text-100 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-200 rounded-lg p-6">
                <h2 className="text-xl font-medium mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-primary-100 bg-100'
                        : 'border-300 hover:border-primary-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CreditCardIcon className="h-6 w-6" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('shop')}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-colors ${
                      paymentMethod === 'shop'
                        ? 'border-primary-100 bg-100'
                        : 'border-300 hover:border-primary-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <BuildingStorefrontIcon className="h-6 w-6" />
                    <span>Shop Pay</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:col-span-4">
              <div className="bg-200 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={item.images[0]?.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-300 
                                       flex items-center justify-center text-xs">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          {item.selectedSize && (
                            <p className="text-sm text-text-200">Size: {item.selectedSize}</p>
                          )}
                        </div>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-300 pt-4">
                  <div className="flex justify-between text-text-200">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-200">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-200">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-3 border-t border-300">
                    <span>Total</span>
                    <span>${total.toFixed(2)} USD</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-6 bg-gradient-to-r from-primary-100 to-primary-200 
                             hover:from-primary-200 hover:to-primary-300 text-white py-3 rounded-md
                             transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout; 