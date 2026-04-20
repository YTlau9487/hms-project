import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { LayoutDashboard, BedDouble, CalendarCheck, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Route guard: redirect to login if not authenticated or not staff/admin
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  const sidebarItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/rooms', label: 'Rooms', icon: BedDouble },
    { path: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  ];

  const stayManagementItems = [
    { path: '/admin/stay-management/check-in', label: 'Check-in', icon: LogIn },
    { path: '/admin/stay-management/check-out', label: 'Check-out', icon: LogOut },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <div className="flex-grow flex relative">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-[60] p-4 bg-primary text-primary-foreground rounded-full shadow-xl hover:opacity-90 transition-all cursor-pointer hover:scale-105"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile overlay - covers entire viewport when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-[55] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - hidden on mobile when closed, sticky on desktop below navbar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-[60]
          w-64 bg-background border-r border-border p-4
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          h-[calc(100vh-4rem)] overflow-y-auto
        `}>
          <div className="lg:hidden flex justify-end mb-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-muted rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
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

            {/* Stay Management Section */}
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Stay Management
              </p>
              <div className="space-y-2">
                {stayManagementItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsSidebarOpen(false);
                      }}
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
              </div>
            </div>
          </nav>
        </aside>
        
        {/* Main content - full width on mobile, flex-grow on lg+ */}
        <main className="flex-grow w-full lg:w-auto p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};