import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';

function OrderSuccess() {
  const location = useLocation();
  const { clearCart } = useCart();
  const order = location.state?.order;

  useEffect(() => {
    if (order) {
      clearCart();
    }
  }, [order, clearCart]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-text-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No order found</h1>
            <Link to="/products" className="text-primary-100 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-text-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-[#212121] rounded-lg p-6">
          <div className="text-center mb-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Successful!</h1>
            <p className="text-text-200">Thank you for your purchase</p>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-xl font-medium mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-200">Order ID</p>
                  <p className="font-medium">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-text-200">Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-text-200">
                          Quantity: {item.quantity}
                          {item.selectedSize && ` | Size: ${item.selectedSize}`}
                        </p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-text-200">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text-200">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text-200">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-800">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-block bg-primary-100 text-white px-6 py-2 rounded-md hover:bg-primary-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess; 