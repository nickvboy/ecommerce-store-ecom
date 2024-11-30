import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Button } from "../components/ui/button";

function Checkout() {
  const { cartItems } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10.00; // Example shipping cost
  const tax = subtotal * 0.13; // Example tax rate 13%
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-text-100 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link 
          to="/cart" 
          className="inline-flex items-center text-text-200 hover:text-primary-100 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          BACK TO CART
        </Link>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-8">
            <div className="bg-[#212121] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-medium mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md 
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#212121] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-medium mb-6">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md 
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md 
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md 
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md 
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-200 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md 
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#212121] rounded-lg p-6">
              <h2 className="text-xl font-medium mb-6">Payment Method</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border ${
                    paymentMethod === 'card'
                      ? 'border-primary-100 bg-[#1A1A1A]'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6" />
                  <span>Credit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('shop')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border ${
                    paymentMethod === 'shop'
                      ? 'border-primary-100 bg-[#1A1A1A]'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <BuildingStorefrontIcon className="h-6 w-6" />
                  <span>Shop Pay</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:col-span-4">
            <div className="bg-[#212121] rounded-lg p-6 sticky top-24">
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
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-800 
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
              <div className="space-y-3 border-t border-gray-800 pt-4">
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
                <div className="flex justify-between text-lg font-medium pt-3 border-t border-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)} USD</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-[#FF6600] hover:bg-[#FF7719] text-white py-3 rounded-md"
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout; 