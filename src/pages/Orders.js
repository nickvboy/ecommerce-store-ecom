import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { API_BASE_URL } from '../config';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.isGuest) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/email/${user.email}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        const sanitizedOrders = data.map(order => ({
          ...order,
          total: order.totalAmount || 0,
          status: order.status || 'pending',
          items: (order.items || []).map(item => ({
            ...item,
            price: item.price || 0,
            quantity: item.quantity || 1,
            name: item.product?.name || 'Product Not Available',
            image: item.product?.images?.[0] || ''
          }))
        }));
        setOrders(sanitizedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>
        
        {!orders?.length ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-text-200" />
            <h3 className="mt-2 text-lg font-medium text-white">No orders yet</h3>
            <p className="mt-1 text-text-200">Start shopping to see your orders here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id || Math.random()}
                className="bg-bg-200 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-bg-300 pb-4">
                    <div>
                      <p className="text-sm text-text-300">Order placed</p>
                      <p className="text-text-100">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date not available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-300">Order status</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${order.status === 'completed' ? 'bg-primary-100/10 text-primary-100' :
                          order.status === 'processing' ? 'bg-blue-100/10 text-blue-500' :
                          'bg-yellow-100/10 text-yellow-500'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-300">Total</p>
                      <p className="text-text-100 font-medium">
                        ${Number(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item._id || Math.random()} className="flex items-center">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-bg-300 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <ShoppingBagIcon className="w-8 h-8 text-text-300" />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-text-100">{item.name}</h4>
                          <div className="mt-1 flex items-center text-sm text-text-300">
                            <span>Quantity: {item.quantity}</span>
                            <span className="mx-2">•</span>
                            <span>Price: ${Number(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders; 