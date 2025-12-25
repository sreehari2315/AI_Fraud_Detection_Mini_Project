import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  location: string;
  type: string;
}

const AdminAnalytics = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          setTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Status distribution data
  const statusData = [
    { name: 'Safe', value: transactions.filter(t => t.status === 'Safe').length, color: 'hsl(145, 100%, 45%)' },
    { name: 'Fraud', value: transactions.filter(t => t.status === 'Fraud').length, color: 'hsl(0, 90%, 55%)' },
    { name: 'Review', value: transactions.filter(t => t.status === 'Review').length, color: 'hsl(45, 100%, 50%)' },
  ].filter(d => d.value > 0);

  // Location distribution
  const locationData = transactions.reduce((acc: Record<string, number>, t) => {
    acc[t.location] = (acc[t.location] || 0) + 1;
    return acc;
  }, {});

  const locationChartData = Object.entries(locationData).map(([name, value]) => ({
    name,
    transactions: value,
  }));

  // Transaction type distribution
  const typeData = transactions.reduce((acc: Record<string, number>, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value,
  }));

  // Amount ranges
  const amountRanges = [
    { range: '$0-100', count: transactions.filter(t => t.amount <= 100).length },
    { range: '$100-500', count: transactions.filter(t => t.amount > 100 && t.amount <= 500).length },
    { range: '$500-1000', count: transactions.filter(t => t.amount > 500 && t.amount <= 1000).length },
    { range: '$1000-5000', count: transactions.filter(t => t.amount > 1000 && t.amount <= 5000).length },
    { range: '$5000+', count: transactions.filter(t => t.amount > 5000).length },
  ];

  // Calculate average risk by location
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const avgAmount = transactions.length > 0 ? (totalAmount / transactions.length).toFixed(2) : '0';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Transaction insights and trends</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-sm">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-sm">Avg. Amount</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${avgAmount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-sm">Total Analyzed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-destructive" />
            <span className="text-muted-foreground text-sm">Fraud Rate</span>
          </div>
          <p className="text-2xl font-bold text-destructive">
            {transactions.length > 0
              ? ((transactions.filter(t => t.status === 'Fraud').length / transactions.length) * 100).toFixed(1)
              : 0}%
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 8%)',
                      border: '1px solid hsl(180 30% 20%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No transaction data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Location Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Transactions by Location</h3>
          <div className="h-64">
            {locationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 30% 20%)" />
                  <XAxis dataKey="name" stroke="hsl(180 20% 60%)" />
                  <YAxis stroke="hsl(180 20% 60%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 8%)',
                      border: '1px solid hsl(180 30% 20%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="transactions" fill="hsl(180 100% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No location data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Amount Ranges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Amount Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 30% 20%)" />
                <XAxis dataKey="range" stroke="hsl(180 20% 60%)" />
                <YAxis stroke="hsl(180 20% 60%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222 47% 8%)',
                    border: '1px solid hsl(180 30% 20%)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(145 100% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Transaction Types</h3>
          <div className="h-64">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 30% 20%)" />
                  <XAxis type="number" stroke="hsl(180 20% 60%)" />
                  <YAxis dataKey="name" type="category" stroke="hsl(180 20% 60%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 8%)',
                      border: '1px solid hsl(180 30% 20%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(280 100% 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No type data available
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
