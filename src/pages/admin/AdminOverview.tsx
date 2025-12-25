import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  fraudDetected: number;
  safeTransactions: number;
  reviewPending: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTransactions: 0,
    fraudDetected: 0,
    safeTransactions: 0,
    reviewPending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch transaction stats
        const { data: transactions } = await supabase
          .from('transactions')
          .select('status');

        const transactionStats = transactions?.reduce(
          (acc, t) => {
            acc.total++;
            if (t.status === 'Fraud') acc.fraud++;
            else if (t.status === 'Safe') acc.safe++;
            else if (t.status === 'Review') acc.review++;
            return acc;
          },
          { total: 0, fraud: 0, safe: 0, review: 0 }
        ) || { total: 0, fraud: 0, safe: 0, review: 0 };

        setStats({
          totalUsers: userCount || 0,
          totalTransactions: transactionStats.total,
          fraudDetected: transactionStats.fraud,
          safeTransactions: transactionStats.safe,
          reviewPending: transactionStats.review,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
    {
      title: 'Fraud Detected',
      value: stats.fraudDetected,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
    },
    {
      title: 'Safe Transactions',
      value: stats.safeTransactions,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
    },
    {
      title: 'Pending Review',
      value: stats.reviewPending,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground">System statistics and monitoring</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-6 border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${stat.color}`}>
                {isLoading ? '--' : stat.value.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground">ML Model</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success text-sm">Online v2.1</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success text-sm">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-muted-foreground">API Gateway</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success text-sm">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Detection Rate
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground text-sm">Safe Transactions</span>
                <span className="text-success text-sm">
                  {stats.totalTransactions > 0
                    ? ((stats.safeTransactions / stats.totalTransactions) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{
                    width: stats.totalTransactions > 0
                      ? `${(stats.safeTransactions / stats.totalTransactions) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground text-sm">Fraud Detected</span>
                <span className="text-destructive text-sm">
                  {stats.totalTransactions > 0
                    ? ((stats.fraudDetected / stats.totalTransactions) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive rounded-full transition-all duration-500"
                  style={{
                    width: stats.totalTransactions > 0
                      ? `${(stats.fraudDetected / stats.totalTransactions) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground text-sm">Pending Review</span>
                <span className="text-yellow-400 text-sm">
                  {stats.totalTransactions > 0
                    ? ((stats.reviewPending / stats.totalTransactions) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{
                    width: stats.totalTransactions > 0
                      ? `${(stats.reviewPending / stats.totalTransactions) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
