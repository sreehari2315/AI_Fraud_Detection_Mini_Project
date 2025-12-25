import { LayoutDashboard, FileText, ScanLine, TrendingUp, Settings, Shield, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Transaction Logs', url: '/transactions', icon: FileText },
  { title: 'New Scan', url: '/scan', icon: ScanLine },
  { title: 'Risk Insights', url: '/insights', icon: TrendingUp },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user, isAdmin } = useAuth();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      className={`${collapsed ? 'w-16' : 'w-64'} border-r border-border/30 bg-card/80 backdrop-blur-xl transition-all duration-300 flex flex-col`}
      collapsible="icon"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative p-2 rounded-xl bg-primary/10 border border-primary/30">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-bold text-foreground neon-text truncate">FraudGuard</h2>
              <p className="text-xs text-muted-foreground">AI Detection</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="flex-1 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-all ${
                        isActive(item.url)
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                      activeClassName="bg-primary/10 text-primary border border-primary/30"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-border/30">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {isAdmin && (
              <NavLink 
                to="/admin" 
                className="text-xs text-primary hover:underline"
              >
                Admin Panel →
              </NavLink>
            )}
          </div>
        )}
        
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </Sidebar>
  );
}
