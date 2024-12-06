import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Checkbox } from "./ui/checkbox";

function CartOverlay({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;
    await updateQuantity(item.id, item.selectedSize, newQuantity);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-bg-100/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-bg-100 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-bg-300">
                      <Dialog.Title className="text-xl font-medium text-text-100">Shopping Cart</Dialog.Title>
                      <button
                        type="button"
                        className="text-text-200 hover:text-text-100"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* LTT Stream Message Checkbox */}
                    <div className="px-4 py-3 border-b border-bg-300">
                      <div className="flex items-center gap-2">
                        <Checkbox id="ltt-stream" />
                        <label htmlFor="ltt-stream" className="text-sm text-text-200">
                          I would like my purchase to appear as a Merch Message on the LTT Stream
                        </label>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <p className="text-center text-text-200 py-8">Your cart is empty</p>
                      ) : (
                        <div className="px-4 py-6">
                          {/* Headers */}
                          <div className="grid grid-cols-12 gap-4 mb-4 text-sm text-text-200 uppercase">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-3 text-center">Quantity</div>
                            <div className="col-span-3 text-right">Total</div>
                          </div>

                          {/* Items */}
                          {cartItems.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}`} className="grid grid-cols-12 gap-4 py-4 border-b border-bg-300">
                              {/* Product Info */}
                              <div className="col-span-6 flex gap-3">
                                <div className="w-20 h-20 bg-bg-200 rounded-md overflow-hidden">
                                  <img
                                    src={item.images[0]?.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="text-text-100 font-medium">{item.name}</h3>
                                  <p className="text-text-200 text-sm">${item.price.toFixed(2)} USD</p>
                                  {item.selectedSize && (
                                    <p className="text-text-200 text-sm">Size: {item.selectedSize}</p>
                                  )}
                                </div>
                              </div>

                              {/* Quantity */}
                              <div className="col-span-3 flex items-center justify-center">
                                <div className="flex items-center bg-bg-200 rounded-md">
                                  <button 
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="px-3 py-1 text-text-200 hover:text-text-100 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 text-text-100">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleQuantityChange(item, 1)}
                                    disabled={item.quantity >= item.stock}
                                    className={`px-3 py-1 text-text-200 hover:text-text-100 transition-colors
                                      ${item.quantity >= item.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    +
                                  </button>
                                </div>
                                {item.quantity >= item.stock && (
                                  <p className="text-xs text-yellow-500 mt-1">Max stock reached</p>
                                )}
                              </div>

                              {/* Total & Remove */}
                              <div className="col-span-3 flex items-center justify-between">
                                <span className="text-text-100">${(item.price * item.quantity).toFixed(2)} USD</span>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-text-200 hover:text-text-100 transition-colors"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                      <div className="border-t border-bg-300 px-4 py-6">
                        <div className="flex justify-between text-lg font-medium text-text-100 mb-6">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)} USD</span>
                        </div>
                        <Link
                          to="/checkout"
                          className="block w-full bg-gradient-to-r from-primary-100 to-primary-200 
                            hover:from-primary-200 hover:to-primary-100 text-text-100 text-center py-3 
                            rounded-md transition-all duration-200 transform hover:scale-[1.02]"
                          onClick={onClose}
                        >
                          Checkout
                        </Link>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default CartOverlay; 