import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  amount: number;
  location: string;
  type: string;
  status: string;
  risk_score: number | null;
  created_at: string;
}

const RiskInsights = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Status distribution
  const statusData = [
    { name: 'Safe', value: transactions.filter(t => t.status === 'Safe').length, color: 'hsl(145, 100%, 45%)' },
    { name: 'Fraud', value: transactions.filter(t => t.status === 'Fraud').length, color: 'hsl(0, 90%, 55%)' },
    { name: 'Review', value: transactions.filter(t => t.status === 'Review').length, color: 'hsl(45, 100%, 50%)' },
  ].filter(d => d.value > 0);

  // Transactions by type
  const typeData = ['purchase', 'transfer', 'withdrawal', 'deposit', 'refund'].map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    total: transactions.filter(t => t.type === type).length,
    fraud: transactions.filter(t => t.type === type && t.status === 'Fraud').length,
  })).filter(d => d.total > 0);

  // Location distribution
  const locationData = [...new Set(transactions.map(t => t.location))].map(location => ({
    name: location,
    transactions: transactions.filter(t => t.location === location).length,
    fraudRate: transactions.filter(t => t.location === location && t.status === 'Fraud').length / 
               Math.max(transactions.filter(t => t.location === location).length, 1) * 100,
  })).sort((a, b) => b.transactions - a.transactions).slice(0, 6);

  // Daily trend (last 7 days)
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(t => t.created_at.startsWith(dateStr));
    trendData.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      transactions: dayTransactions.length,
      fraud: dayTransactions.filter(t => t.status === 'Fraud').length,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-lg border border-border/50 rounded-lg p-3 shadow-xl">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Risk Insights</h1>
        <p className="text-muted-foreground">Analyze fraud patterns and trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Analyzed</p>
              <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fraud Rate</p>
              <p className="text-2xl font-bold text-destructive">
                {transactions.length > 0 
                  ? ((transactions.filter(t => t.status === 'Fraud').length / transactions.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Risk Score</p>
              <p className="text-2xl font-bold text-success">
                {transactions.length > 0
                  ? (transactions.reduce((acc, t) => acc + (t.risk_score || 0), 0) / transactions.length * 100).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 30% 20% / 0.3)" />
              <XAxis dataKey="day" stroke="hsl(180 20% 60%)" fontSize={12} />
              <YAxis stroke="hsl(180 20% 60%)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="transactions" stroke="hsl(180, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(180, 100%, 50%)' }} name="Total" />
              <Line type="monotone" dataKey="fraud" stroke="hsl(0, 90%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(0, 90%, 55%)' }} name="Fraud" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By Transaction Type */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">By Transaction Type</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 30% 20% / 0.3)" />
                <XAxis dataKey="name" stroke="hsl(180 20% 60%)" fontSize={12} />
                <YAxis stroke="hsl(180 20% 60%)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="hsl(180, 100%, 50%)" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud" fill="hsl(0, 90%, 55%)" name="Fraud" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>

        {/* By Location */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Locations</h3>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(180 30% 20% / 0.3)" />
                <XAxis type="number" stroke="hsl(180 20% 60%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(180 20% 60%)" fontSize={12} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="transactions" fill="hsl(180, 100%, 50%)" name="Transactions" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskInsights;
