import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, Activity, TrendingUp, Users, Clock, AlertTriangle, Eye } from "lucide-react";

export interface Transaction {
  id: string;
  amount: number;
  location: string;
  type: string;
  status: "Safe" | "Fraud" | "Review";
  riskReason?: string;
  time: string;
}

interface DashboardProps {
  riskScore: number | null;
  prediction: "Fraud" | "Safe" | null;
  riskReason?: string;
  isLoading: boolean;
  isScanning: boolean;
  recentTransactions: Transaction[];
  analyzedCount: number;
}

const Dashboard = ({ 
  riskScore, 
  prediction, 
  riskReason,
  isLoading, 
  isScanning,
  recentTransactions,
  analyzedCount 
}: DashboardProps) => {
  const isFraud = prediction === "Fraud";
  const isSafe = prediction === "Safe";

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <AnimatePresence mode="wait">
        {prediction && !isScanning && (
          <motion.div
            key={prediction}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`p-4 rounded-xl border flex items-center gap-4 ${
              isFraud
                ? "glass-card-danger border-destructive/50 bg-destructive/10"
                : "glass-card-success border-success/50 bg-success/10"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {isFraud ? (
                <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
              ) : (
                <Shield className="w-8 h-8 text-success" />
              )}
            </motion.div>
            <div>
              <h3
                className={`text-lg font-semibold ${
                  isFraud ? "text-destructive neon-text-danger" : "text-success neon-text-success"
                }`}
              >
                {isFraud ? "⚠️ Fraudulent Transaction Detected" : "✓ Transaction Verified Safe"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {riskReason || (isFraud
                  ? "This transaction has been flagged for suspicious activity."
                  : "No suspicious patterns detected in this transaction.")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning State */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            {/* Radar scan effect */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"
                animate={{
                  y: ["0%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at center, hsl(180 100% 50% / 0.1) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary mb-4"
              />
              <motion.p
                className="text-xl font-semibold text-primary neon-text"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Scanning Transaction...
              </motion.p>
              <p className="text-muted-foreground text-sm mt-2">
                Analyzing patterns with ML model
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Card */}
        <motion.div
          layout
          className={`p-6 rounded-xl transition-all duration-500 relative overflow-hidden ${
            isLoading || isScanning
              ? "glass-card"
              : isFraud
              ? "glass-card-danger"
              : isSafe
              ? "glass-card-success"
              : "glass-card"
          }`}
        >
          {/* Flash effect on result */}
          <AnimatePresence>
            {prediction && !isScanning && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 ${
                  isFraud ? "bg-destructive/30" : "bg-success/30"
                }`}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-sm font-medium">Risk Score</span>
              <Activity
                className={`w-5 h-5 ${
                  isFraud ? "text-destructive" : isSafe ? "text-success" : "text-primary"
                }`}
              />
            </div>
            <div className="flex items-end gap-2">
              <motion.span
                key={riskScore}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-4xl font-bold ${
                  isFraud
                    ? "text-destructive neon-text-danger"
                    : isSafe
                    ? "text-success neon-text-success"
                    : "text-primary neon-text"
                }`}
              >
                {riskScore !== null ? `${(riskScore * 100).toFixed(1)}%` : "--"}
              </motion.span>
              <span className="text-muted-foreground text-sm mb-1">probability</span>
            </div>
            <div className="mt-4 h-2 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: riskScore !== null ? `${riskScore * 100}%` : "0%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isFraud
                    ? "bg-gradient-to-r from-destructive/50 to-destructive"
                    : isSafe
                    ? "bg-gradient-to-r from-success/50 to-success"
                    : "bg-gradient-to-r from-primary/50 to-primary"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Transactions Today */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Analyzed Today</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <motion.span 
              key={analyzedCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-foreground"
            >
              {(1247 + analyzedCount).toLocaleString()}
            </motion.span>
            <span className="text-success text-sm mb-1">+{analyzedCount > 0 ? analyzedCount : 12.5}%</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">transactions processed</p>
        </div>

        {/* Fraud Rate */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Fraud Rate</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground">0.8%</span>
            <span className="text-destructive text-sm mb-1">-2.1%</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">from last week</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            Live Feed • {recentTransactions.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">
                  Location
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {recentTransactions.slice(0, 5).map((activity, index) => (
                  <motion.tr
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, backgroundColor: "hsl(180 100% 50% / 0.1)" }}
                    animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    layout
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      ${activity.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{activity.location}</td>
                    <td className="py-4 px-4 text-muted-foreground capitalize">{activity.type}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === "Fraud"
                            ? "bg-destructive/20 text-destructive border border-destructive/30"
                            : activity.status === "Review"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-success/20 text-success border border-success/30"
                        }`}
                      >
                        {activity.status === "Fraud" ? (
                          <ShieldAlert className="w-3 h-3 mr-1" />
                        ) : activity.status === "Review" ? (
                          <Eye className="w-3 h-3 mr-1" />
                        ) : (
                          <Shield className="w-3 h-3 mr-1" />
                        )}
                        {activity.status}
                        {activity.riskReason && (
                          <span className="ml-1 opacity-70">• {activity.riskReason}</span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{activity.time}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No transactions analyzed yet. Submit a transaction to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
