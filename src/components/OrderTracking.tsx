import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle } from 'lucide-react';

interface Order {
  id: number;
  status: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  unit: string;
  total_price: number;
  created_at: string;
  product_image: string;
}

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data);
      setError('');
    } catch (err) {
      setOrder(null);
      setError('Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 3;
      case 'In Progress':
        return 2;
      case 'Pending':
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-8 w-8 text-green-600" />
          <h2 className="text-3xl font-bold text-gray-800">Track Your Order</h2>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 disabled:bg-green-400"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="border-b pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Order #{order.id}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                    order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">${order.total_price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10"></div>
              <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Order Placed</span>
              </div>
              <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Delivered</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Order Details</h4>
              <div className="flex items-center space-x-4">
                <img
                  src={order.product_image}
                  alt={order.product_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium text-gray-800">{order.product_name}</p>
                  <p className="text-gray-600">Quantity: {order.quantity} {order.unit}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;