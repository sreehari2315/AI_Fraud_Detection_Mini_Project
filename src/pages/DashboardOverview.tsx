import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Stats {
  totalTransactions: number;
  fraudDetected: number;
  safeTransactions: number;
  pendingReview: number;
  fraudRate: number;
}

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalTransactions: 0,
    fraudDetected: 0,
    safeTransactions: 0,
    pendingReview: 0,
    fraudRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('status')
        .eq('user_id', user?.id);

      if (transactions) {
        const total = transactions.length;
        const fraud = transactions.filter(t => t.status === 'Fraud').length;
        const safe = transactions.filter(t => t.status === 'Safe').length;
        const pending = transactions.filter(t => t.status === 'Review').length;

        setStats({
          totalTransactions: total,
          fraudDetected: fraud,
          safeTransactions: safe,
          pendingReview: pending,
          fraudRate: total > 0 ? (fraud / total) * 100 : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
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
      value: stats.pendingReview,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your fraud detection metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`glass-card p-5 border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                  {loading ? '...' : stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fraud Rate Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Fraud Rate</h2>
            <p className="text-sm text-muted-foreground">Percentage of fraudulent transactions</p>
          </div>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex items-end gap-4">
          <span className={`text-5xl font-bold ${stats.fraudRate > 5 ? 'text-destructive' : 'text-success'}`}>
            {loading ? '...' : stats.fraudRate.toFixed(1)}%
          </span>
          <span className="text-muted-foreground mb-2">of all transactions</span>
        </div>
        
        <div className="mt-4 h-3 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${stats.fraudRate > 5 ? 'bg-destructive' : 'bg-success'}`}
            style={{ width: `${Math.min(stats.fraudRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 border border-primary/30 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/scan'}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">New Transaction Scan</h3>
              <p className="text-sm text-muted-foreground">Analyze a transaction for fraud</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => window.location.href = '/transactions'}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/50">
              <Activity className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View All Transactions</h3>
              <p className="text-sm text-muted-foreground">Browse transaction history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
