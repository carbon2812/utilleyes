import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import StatsCards from '../../components/Admin/Dashboard/StatsCards';
import SalesChart from '../../components/Admin/Dashboard/SalesChart';
import RecentOrders from '../../components/Admin/Dashboard/RecentOrders';
import LowStockAlert from '../../components/Admin/Dashboard/LowStockAlert';
import type { Order } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample sales data for chart
  const salesData = [
    { name: 'Jan', sales: 45000, orders: 120 },
    { name: 'Feb', sales: 52000, orders: 145 },
    { name: 'Mar', sales: 48000, orders: 135 },
    { name: 'Apr', sales: 61000, orders: 168 },
    { name: 'May', sales: 55000, orders: 152 },
    { name: 'Jun', sales: 67000, orders: 189 },
    { name: 'Jul', sales: 72000, orders: 201 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('payment_status', 'paid');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        // Fetch total orders
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total products
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalRevenue,
          totalOrders: totalOrders || 0,
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
        });

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(ordersData || []);

        // Fetch low stock items
        const { data: lowStockData } = await supabase
          .from('product_variants')
          .select(`
            id,
            stock_quantity,
            size,
            color,
            product:products(name, images)
          `)
          .lt('stock_quantity', 10)
          .eq('is_active', true)
          .limit(5);

        const formattedLowStock = lowStockData?.map(item => ({
          id: item.id,
          name: item.product?.name || 'Unknown Product',
          variant: `${item.size} - ${item.color}`,
          stock: item.stock_quantity,
          image: item.product?.images?.[0] || '/placeholder.jpg'
        })) || [];

        setLowStockItems(formattedLowStock);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesData} type="line" />
        </div>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
        <div>
          <LowStockAlert items={lowStockItems} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;