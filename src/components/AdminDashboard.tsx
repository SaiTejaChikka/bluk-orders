import React, { useState, useEffect } from 'react';
import { ClipboardList, Package, TrendingUp, Users, Edit, Trash, Plus } from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  status: string;
  total_price: number;
  created_at: string;
  product_name: string;
  quantity: number;
  unit: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  unit: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();
    fetchProducts();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      // Fetch latest orders after update
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const calculateMetrics = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const uniqueCustomers = new Set(orders.map(order => order.customer_name)).size;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const totalOrders = orders.length;
    const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders * 100).toFixed(1) : '0';

    return {
      totalOrders,
      activeCustomers: uniqueCustomers,
      revenue: totalRevenue,
      pendingOrders,
      deliveryRate: `${deliveryRate}%`
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          icon={<Package className="h-6 w-6" />}
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          trend={`${metrics.deliveryRate} delivered`}
          trendType="success"
        />
        <DashboardCard
          icon={<Users className="h-6 w-6" />}
          title="Active Customers"
          value={metrics.activeCustomers.toString()}
          trend="+4.3% this week"
          trendType="success"
        />
        <DashboardCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Revenue"
          value={`$${metrics.revenue.toFixed(2)}`}
          trend="+8.9% this month"
          trendType="success"
        />
        <DashboardCard
          icon={<ClipboardList className="h-6 w-6" />}
          title="Pending Orders"
          value={metrics.pendingOrders.toString()}
          trend="Needs attention"
          trendType={metrics.pendingOrders > 5 ? "warning" : "success"}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <div className="flex space-x-2">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Refresh Orders
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity} {order.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Mark Delivered
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendType?: 'success' | 'warning' | 'danger';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, trend, trendType = 'success' }) => {
  const trendColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="bg-blue-100 rounded-lg p-3">
            {icon}
          </div>
        </div>
        <div className="ml-5">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
          <div className={`mt-1 text-sm ${trendColors[trendType]}`}>
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;