import { LayoutDashboard, Users, Settings, Activity, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Analytics', url: '/admin/analytics', icon: Activity },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      className={`${collapsed ? 'w-14' : 'w-60'} border-r border-border/30 bg-card/50 backdrop-blur-xl transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative p-2 rounded-xl bg-primary/10 border border-primary/30">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Admin</h2>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground px-4">Menu</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                        isActive(item.url)
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                      activeClassName="bg-primary/10 text-primary border border-primary/30"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
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
          <div className="mb-4 px-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all flex-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Back to App</span>}
          </NavLink>
          
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
