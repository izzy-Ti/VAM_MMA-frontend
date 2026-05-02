import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, DollarSign, Activity, TrendingUp, Clock } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">{error}</div>;
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Deposits', value: `${stats?.totalDeposits || 0} ETB`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Pending Deposits', value: `${stats?.totalPendingDeposits || 0} ETB`, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Total Bets Amount', value: `${stats?.totalBetsAmount || 0} ETB`, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'System Profit', value: `${stats?.totalSystemProfit || 0} ETB`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.bg}`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
