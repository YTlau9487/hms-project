import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { LayoutDashboard, BedDouble, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Route guard: redirect to login if not authenticated or not staff
  if (!user || user.role !== 'staff') {
    return <Navigate to="/login" replace />;
  }

  const sidebarItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/rooms', label: 'Rooms', icon: BedDouble },
    { path: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside className="w-64 bg-muted/30 border-r border-border p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};