import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldCheck, User, MoreVertical, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Fetch roles
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('*');

      if (roleError) throw roleError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user',
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-primary" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-yellow-400" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/20 text-primary border border-primary/30';
      case 'moderator':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-secondary text-muted-foreground border border-border/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {users.length} total users
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-medium">
                    User
                  </th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-medium">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-medium">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-medium">
                    Joined
                  </th>
                  <th className="text-right py-4 px-6 text-muted-foreground text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {(user.display_name || user.email || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {user.display_name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {user.email || 'No email'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user.id !== currentUser?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem
                              onClick={() => updateUserRole(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                              className="cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateUserRole(user.id, 'moderator')}
                              disabled={user.role === 'moderator'}
                              className="cursor-pointer"
                            >
                              <Shield className="w-4 h-4 mr-2 text-yellow-400" />
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateUserRole(user.id, 'user')}
                              disabled={user.role === 'user'}
                              className="cursor-pointer"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Make User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminUsers;
