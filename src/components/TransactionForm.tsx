import { useState } from "react";
import { DollarSign, Clock, MapPin, CreditCard, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionFormProps {
  onSubmit: (data: TransactionData) => Promise<void>;
  isLoading: boolean;
}

export interface TransactionData {
  amount: number;
  time: number;
  location: string;
  type: string;
}

const TransactionForm = ({ onSubmit, isLoading }: TransactionFormProps) => {
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !time || !location || !type) return;

    await onSubmit({
      amount: parseFloat(amount),
      time: parseFloat(time),
      location,
      type,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">New Transaction</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount Field */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Amount ($)
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
              required
            />
          </div>
        </div>

        {/* Time Field */}
        <div className="space-y-2">
          <Label htmlFor="time" className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time (0-24 hours)
          </Label>
          <Input
            id="time"
            type="number"
            step="0.1"
            min="0"
            max="24"
            placeholder="12.5"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
            required
          />
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Select value={location} onValueChange={setLocation} required>
            <SelectTrigger className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="NY">New York (NY)</SelectItem>
              <SelectItem value="CA">California (CA)</SelectItem>
              <SelectItem value="TX">Texas (TX)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Field */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-muted-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Transaction Type
          </Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !amount || !time || !location || !type}
        className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_hsl(180_100%_50%_/_0.3)] hover:shadow-[0_0_30px_hsl(180_100%_50%_/_0.5)] disabled:opacity-50 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Analyze Transaction
          </>
        )}
      </Button>
    </form>
  );
};

export default TransactionForm;
