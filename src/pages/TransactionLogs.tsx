import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Transaction {
  id: string;
  amount: number;
  location: string;
  type: string;
  status: string;
  risk_score: number | null;
  risk_reason: string | null;
  created_at: string;
}

const TransactionLogs = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
        .order('created_at', { ascending: false });

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Fraud':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'Safe':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Review':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Fraud: 'bg-destructive/20 text-destructive border-destructive/30',
      Safe: 'bg-success/20 text-success border-success/30',
      Review: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || 'bg-secondary text-muted-foreground'}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transaction Logs</h1>
        <p className="text-muted-foreground">View and search your transaction history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, type, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              {statusFilter || 'All Status'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Safe')}>Safe</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Fraud')}>Fraud</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Review')}>Review</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Score</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4 text-sm text-foreground">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-foreground">
                      ${transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground capitalize">
                      {transaction.type}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {transaction.location}
                    </td>
                    <td className="py-4 px-4">
                      {transaction.risk_score !== null && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${transaction.risk_score > 0.7 ? 'bg-destructive' : transaction.risk_score > 0.4 ? 'bg-yellow-400' : 'bg-success'}`}
                              style={{ width: `${transaction.risk_score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(transaction.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionLogs;
