import { useState, useEffect } from 'react';
import { User, Mail, Key, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const UserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user?.id)
        .single();

      if (data) {
        setProfile({
          displayName: data.display_name || '',
          email: data.email || user?.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Information
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              placeholder="Your name"
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-secondary/30 border-border/30 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          API Configuration
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
            <p className="text-sm text-muted-foreground mb-2">ML Backend Endpoint</p>
            <code className="text-sm text-foreground bg-background/50 px-2 py-1 rounded">
              http://localhost:8000/predict
            </code>
          </div>
          
          <p className="text-sm text-muted-foreground">
            The system automatically falls back to smart rule-based analysis when the ML backend is unavailable.
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">User ID</span>
            <code className="text-foreground text-xs">{user?.id.slice(0, 8)}...</code>
          </div>
          <div className="flex justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">Account Created</span>
            <span className="text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Last Sign In</span>
            <span className="text-foreground">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
