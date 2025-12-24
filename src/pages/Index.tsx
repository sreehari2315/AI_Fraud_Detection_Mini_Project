import { useState, useRef } from "react";
import { Shield, Activity, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TransactionForm, { TransactionData } from "@/components/TransactionForm";
import Dashboard, { Transaction } from "@/components/Dashboard";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<"Fraud" | "Safe" | null>(null);
  const [riskReason, setRiskReason] = useState<string>("");
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  
  // Track submission timestamps for velocity detection
  const submissionTimestamps = useRef<number[]>([]);

  const analyzeWithSmartRules = (data: TransactionData): { 
    score: number; 
    status: "Safe" | "Fraud" | "Review"; 
    reason: string 
  } => {
    const now = Date.now();
    
    // Add current timestamp
    submissionTimestamps.current.push(now);
    
    // Keep only timestamps from last 30 seconds
    submissionTimestamps.current = submissionTimestamps.current.filter(
      ts => now - ts < 30000
    );

    // Rule 1: Velocity Check - 3+ transactions in 10 seconds
    const recentCount = submissionTimestamps.current.filter(
      ts => now - ts < 10000
    ).length;
    
    if (recentCount >= 3) {
      return {
        score: 0.92,
        status: "Fraud",
        reason: "High Frequency Alert"
      };
    }

    // Rule 2: Whale Alert - Amount > $5000
    if (data.amount > 5000) {
      return {
        score: 0.75,
        status: "Review",
        reason: "Manual Review Required"
      };
    }

    // Rule 3: Geo-Mismatch - International + late night (2-5 AM)
    const hour = data.time;
    if (data.location === "TX" && hour >= 2 && hour <= 5) {
      return {
        score: 0.68,
        status: "Review",
        reason: "Unusual Time Pattern"
      };
    }

    // Rule 4: Large transfer at odd hours
    if (data.type === "transfer" && data.amount > 1000 && (hour < 6 || hour > 22)) {
      return {
        score: 0.55,
        status: "Review",
        reason: "Off-Hours Transfer"
      };
    }

    // Rule 5: Very small transactions (testing stolen cards)
    if (data.amount < 5 && data.type === "purchase") {
      return {
        score: 0.45,
        status: "Review",
        reason: "Micro-Transaction Test"
      };
    }

    // Default: Calculate based on amount and patterns
    let baseScore = Math.min(data.amount / 10000, 0.4);
    
    // Add randomness for demo variety
    const randomFactor = Math.random() * 0.3;
    const finalScore = Math.min(baseScore + randomFactor, 0.35);

    return {
      score: finalScore,
      status: "Safe",
      reason: ""
    };
  };

  const formatTimeAgo = (index: number): string => {
    if (index === 0) return "Just now";
    const times = ["30 sec ago", "1 min ago", "2 min ago", "5 min ago", "10 min ago"];
    return times[Math.min(index, times.length - 1)];
  };

  const handleAnalyze = async (data: TransactionData) => {
    setIsLoading(true);
    setIsScanning(true);
    setPrediction(null);
    setRiskScore(null);
    setRiskReason("");

    // Simulate 2-second scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze transaction");
      }

      const result = await response.json();
      
      const score = result.risk_score ?? result.probability ?? 0.5;
      const isFraud = result.prediction === "Fraud" || result.is_fraud;
      
      setRiskScore(score);
      setPrediction(isFraud ? "Fraud" : "Safe");
      setRiskReason(result.reason || "");

      // Add to recent transactions
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: data.amount,
        location: data.location,
        type: data.type,
        status: isFraud ? "Fraud" : "Safe",
        riskReason: result.reason,
        time: "Just now"
      };

      setRecentTransactions(prev => {
        const updated = [newTransaction, ...prev].slice(0, 5);
        return updated.map((t, i) => ({ ...t, time: formatTimeAgo(i) }));
      });
      setAnalyzedCount(prev => prev + 1);

      toast({
        title: isFraud ? "⚠️ Fraud Detected" : "✓ Transaction Safe",
        description: isFraud
          ? "This transaction has been flagged as potentially fraudulent."
          : "No suspicious activity detected.",
        variant: isFraud ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      
      // Use smart mock AI logic
      const analysis = analyzeWithSmartRules(data);
      
      setRiskScore(analysis.score);
      setPrediction(analysis.status === "Safe" ? "Safe" : "Fraud");
      setRiskReason(analysis.reason);

      // Add to recent transactions
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: data.amount,
        location: data.location,
        type: data.type,
        status: analysis.status,
        riskReason: analysis.reason,
        time: "Just now"
      };

      setRecentTransactions(prev => {
        const updated = [newTransaction, ...prev].slice(0, 5);
        return updated.map((t, i) => ({ ...t, time: formatTimeAgo(i) }));
      });
      setAnalyzedCount(prev => prev + 1);

      const toastVariant = analysis.status === "Safe" ? "default" : "destructive";
      const toastTitle = analysis.status === "Fraud" 
        ? "⚠️ Fraud Detected" 
        : analysis.status === "Review"
        ? "👁️ Manual Review Required"
        : "✓ Transaction Safe";

      toast({
        title: toastTitle,
        description: analysis.reason || (analysis.status === "Safe" 
          ? "No suspicious activity detected."
          : "This transaction requires attention."),
        variant: toastVariant,
      });
    } finally {
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Scan line effect overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/30 backdrop-blur-xl bg-background/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                  <div className="relative p-2 rounded-xl bg-primary/10 border border-primary/30">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground neon-text">
                    FraudGuard AI
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time Fraud Detection System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">System Online</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/30">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">ML Model v2.1</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-1">
              <TransactionForm onSubmit={handleAnalyze} isLoading={isLoading} />
              
              {/* Smart Rules Info */}
              <div className="mt-6 glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">🧠 Smart Detection Rules</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span><strong>Velocity:</strong> 3+ scans in 10s = High Risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span><strong>Whale:</strong> Amount {">"} $5,000 = Manual Review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span><strong>Night Owl:</strong> TX + 2-5 AM = Suspicious</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Dashboard */}
            <div className="lg:col-span-2">
              <Dashboard
                riskScore={riskScore}
                prediction={prediction}
                riskReason={riskReason}
                isLoading={isLoading}
                isScanning={isScanning}
                recentTransactions={recentTransactions}
                analyzedCount={analyzedCount}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 mt-12 py-6 backdrop-blur-xl bg-background/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Activity className="w-4 h-4" />
                <span>Powered by Advanced Machine Learning</span>
              </div>
              <div className="text-muted-foreground text-sm">
                © 2024 FraudGuard AI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
