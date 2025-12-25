import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, AlertTriangle, Gauge, Zap, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FraudThresholds {
  high: number;
  medium: number;
  low: number;
}

interface VelocitySettings {
  max_transactions: number;
  time_window_seconds: number;
}

interface WhaleThreshold {
  amount: number;
}

interface SystemStatus {
  online: boolean;
  model_version: string;
}

const AdminSettings = () => {
  const [fraudThresholds, setFraudThresholds] = useState<FraudThresholds>({
    high: 0.8,
    medium: 0.5,
    low: 0.3,
  });
  const [velocitySettings, setVelocitySettings] = useState<VelocitySettings>({
    max_transactions: 3,
    time_window_seconds: 10,
  });
  const [whaleThreshold, setWhaleThreshold] = useState<WhaleThreshold>({
    amount: 5000,
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    online: true,
    model_version: '2.1',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*');

        if (error) throw error;

        data?.forEach((config) => {
          switch (config.key) {
            case 'fraud_thresholds':
              setFraudThresholds(config.value as unknown as FraudThresholds);
              break;
            case 'velocity_settings':
              setVelocitySettings(config.value as unknown as VelocitySettings);
              break;
            case 'whale_threshold':
              setWhaleThreshold(config.value as unknown as WhaleThreshold);
              break;
            case 'system_status':
              setSystemStatus(config.value as unknown as SystemStatus);
              break;
          }
        });
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const saveConfig = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_config')
        .update({ value, updated_by: user?.id })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: `${key.replace(/_/g, ' ')} updated successfully`,
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure fraud detection parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Fraud Thresholds</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">High Risk Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={fraudThresholds.high}
                  onChange={(e) =>
                    setFraudThresholds((prev) => ({
                      ...prev,
                      high: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-secondary/50 border-border/50"
                />
                <span className="text-muted-foreground text-sm">
                  ({(fraudThresholds.high * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Medium Risk Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={fraudThresholds.medium}
                  onChange={(e) =>
                    setFraudThresholds((prev) => ({
                      ...prev,
                      medium: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-secondary/50 border-border/50"
                />
                <span className="text-muted-foreground text-sm">
                  ({(fraudThresholds.medium * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Low Risk Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={fraudThresholds.low}
                  onChange={(e) =>
                    setFraudThresholds((prev) => ({
                      ...prev,
                      low: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-secondary/50 border-border/50"
                />
                <span className="text-muted-foreground text-sm">
                  ({(fraudThresholds.low * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <Button
              onClick={() => saveConfig('fraud_thresholds', fraudThresholds)}
              disabled={isSaving}
              className="w-full mt-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Thresholds
            </Button>
          </div>
        </motion.div>

        {/* Velocity Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Gauge className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-foreground">Velocity Detection</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Max Transactions</Label>
              <Input
                type="number"
                min="1"
                value={velocitySettings.max_transactions}
                onChange={(e) =>
                  setVelocitySettings((prev) => ({
                    ...prev,
                    max_transactions: parseInt(e.target.value) || 1,
                  }))
                }
                className="bg-secondary/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Flag as fraud if more than this many transactions occur
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Time Window (seconds)</Label>
              <Input
                type="number"
                min="1"
                value={velocitySettings.time_window_seconds}
                onChange={(e) =>
                  setVelocitySettings((prev) => ({
                    ...prev,
                    time_window_seconds: parseInt(e.target.value) || 1,
                  }))
                }
                className="bg-secondary/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Within this time window in seconds
              </p>
            </div>

            <Button
              onClick={() => saveConfig('velocity_settings', velocitySettings)}
              disabled={isSaving}
              className="w-full mt-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Velocity Settings
            </Button>
          </div>
        </motion.div>

        {/* Whale Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Whale Alert</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Amount Threshold ($)</Label>
              <Input
                type="number"
                min="0"
                value={whaleThreshold.amount}
                onChange={(e) =>
                  setWhaleThreshold({
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-secondary/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Transactions above this amount require manual review
              </p>
            </div>

            <Button
              onClick={() => saveConfig('whale_threshold', whaleThreshold)}
              disabled={isSaving}
              className="w-full mt-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Whale Threshold
            </Button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold text-foreground">System Status</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <Label className="text-foreground">System Online</Label>
                <p className="text-xs text-muted-foreground">
                  Enable/disable fraud detection
                </p>
              </div>
              <Switch
                checked={systemStatus.online}
                onCheckedChange={(checked) =>
                  setSystemStatus((prev) => ({ ...prev, online: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Model Version</Label>
              <Input
                type="text"
                value={systemStatus.model_version}
                onChange={(e) =>
                  setSystemStatus((prev) => ({
                    ...prev,
                    model_version: e.target.value,
                  }))
                }
                className="bg-secondary/50 border-border/50"
              />
            </div>

            <Button
              onClick={() => saveConfig('system_status', systemStatus)}
              disabled={isSaving}
              className="w-full mt-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save System Status
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
