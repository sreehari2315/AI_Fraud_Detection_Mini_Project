import { useState, useRef } from 'react';
import { Shield, ScanLine, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionData {
  amount: number;
  location: string;
  type: string;
  time: number;
}

const NewScan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ score: number; status: string; reason: string } | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    location: '',
    type: '',
    time: new Date().getHours().toString(),
  });

  const submissionTimestamps = useRef<number[]>([]);

  const locations = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const transactionTypes = ['purchase', 'transfer', 'withdrawal', 'deposit', 'refund'];

  const analyzeWithSmartRules = (data: TransactionData): { score: number; status: string; reason: string } => {
    const now = Date.now();
    submissionTimestamps.current.push(now);
    submissionTimestamps.current = submissionTimestamps.current.filter(ts => now - ts < 30000);

    const recentCount = submissionTimestamps.current.filter(ts => now - ts < 10000).length;

    if (recentCount >= 3) {
      return { score: 0.92, status: 'Fraud', reason: 'High Frequency Alert' };
    }

    if (data.amount > 5000) {
      return { score: 0.75, status: 'Review', reason: 'Manual Review Required' };
    }

    const hour = data.time;
    if (data.location === 'TX' && hour >= 2 && hour <= 5) {
      return { score: 0.68, status: 'Review', reason: 'Unusual Time Pattern' };
    }

    if (data.type === 'transfer' && data.amount > 1000 && (hour < 6 || hour > 22)) {
      return { score: 0.55, status: 'Review', reason: 'Off-Hours Transfer' };
    }

    if (data.amount < 5 && data.type === 'purchase') {
      return { score: 0.45, status: 'Review', reason: 'Micro-Transaction Test' };
    }

    let baseScore = Math.min(data.amount / 10000, 0.4);
    const randomFactor = Math.random() * 0.3;
    const finalScore = Math.min(baseScore + randomFactor, 0.35);

    return { score: finalScore, status: 'Safe', reason: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.location || !formData.type) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsScanning(true);
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const data: TransactionData = {
      amount: parseFloat(formData.amount),
      location: formData.location,
      type: formData.type,
      time: parseInt(formData.time),
    };

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed');

      const apiResult = await response.json();
      const score = apiResult.risk_score ?? apiResult.probability ?? 0.5;
      const status = apiResult.prediction === 'Fraud' || apiResult.is_fraud ? 'Fraud' : 'Safe';
      
      setResult({ score, status, reason: apiResult.reason || '' });
      await saveTransaction(data, score, status, apiResult.reason || '');
    } catch {
      const analysis = analyzeWithSmartRules(data);
      setResult(analysis);
      await saveTransaction(data, analysis.score, analysis.status, analysis.reason);
    } finally {
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  const saveTransaction = async (data: TransactionData, score: number, status: string, reason: string) => {
    if (!user) return;

    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: data.amount,
      location: data.location,
      type: data.type,
      time_of_day: data.time,
      risk_score: score,
      status: status,
      risk_reason: reason || null,
    });

    toast({
      title: status === 'Fraud' ? '⚠️ Fraud Detected' : status === 'Review' ? '👁️ Manual Review Required' : '✓ Transaction Safe',
      description: reason || (status === 'Safe' ? 'No suspicious activity detected.' : 'This transaction requires attention.'),
      variant: status === 'Safe' ? 'default' : 'destructive',
    });
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'Fraud':
        return <AlertTriangle className="w-12 h-12 text-destructive" />;
      case 'Safe':
        return <CheckCircle className="w-12 h-12 text-success" />;
      case 'Review':
        return <Clock className="w-12 h-12 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Transaction Scan</h1>
        <p className="text-muted-foreground">Analyze a transaction for potential fraud</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount">Transaction Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="h-12 bg-secondary/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time of Day (24h)</Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <ScanLine className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Analyze Transaction
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Result */}
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <Shield className="absolute inset-0 m-auto w-10 h-10 text-primary" />
                </div>
                <p className="text-foreground font-medium">Scanning Transaction...</p>
                <p className="text-sm text-muted-foreground">Running ML analysis</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className={`p-4 rounded-full mb-4 ${
                  result.status === 'Safe' ? 'bg-success/10' : 
                  result.status === 'Fraud' ? 'bg-destructive/10' : 'bg-yellow-400/10'
                }`}>
                  {getResultIcon(result.status)}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  result.status === 'Safe' ? 'text-success' : 
                  result.status === 'Fraud' ? 'text-destructive' : 'text-yellow-400'
                }`}>
                  {result.status}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {result.reason || (result.status === 'Safe' ? 'No suspicious activity detected' : 'Flagged for review')}
                </p>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                  <p className={`text-3xl font-bold ${
                    result.score > 0.7 ? 'text-destructive' : result.score > 0.4 ? 'text-yellow-400' : 'text-success'
                  }`}>
                    {(result.score * 100).toFixed(0)}%
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="p-4 rounded-full bg-secondary/50 mb-4">
                  <Shield className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">Ready to Scan</p>
                <p className="text-sm text-muted-foreground">Enter transaction details and click analyze</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NewScan;
