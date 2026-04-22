import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';
import { LayoutDashboard, CalendarCheck, Menu, X, LogIn, LogOut, User, BedDouble, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const STAFF_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  // Show loading state while AuthContext initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Route guard: redirect to login if not authenticated or not staff
  if (!user || user.role !== 'staff') {
    return <Navigate to="/login" replace />;
  }


  const sidebarItems = [
    { path: '/staff/dashboard', label: t('staffLayout.dashboard'), icon: LayoutDashboard },
    { path: '/staff/rooms', label: t('staffLayout.rooms'), icon: BedDouble },
    { path: '/staff/bookings', label: t('staffLayout.bookings'), icon: CalendarCheck },
  ];

  const stayManagementItems = [
    { path: '/staff/stay-management/check-in', label: t('staffLayout.checkIn'), icon: LogIn },
    { path: '/staff/stay-management/check-out', label: t('staffLayout.checkOut'), icon: LogOut },
  ];

  const toggleLanguage = () => {
    const langs = ['en', 'zh-TW', 'zh-CN'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  // Auto-logout timer for staff users
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleLogout, STAFF_IDLE_TIMEOUT);
    };

    resetTimer();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [handleLogout]);


  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Staff Header */}
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">{t('staffLayout.title')}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={i18n.language === 'en' ? '切換至繁體中文' : i18n.language === 'zh-TW' ? '切換至简体中文' : 'Switch to English'}
          >
            <Languages className="w-4 h-4" />
            <span className="hidden md:inline">{i18n.language === 'en' ? 'EN' : i18n.language === 'zh-TW' ? '繁' : '简'}</span>
          </button>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium whitespace-nowrap">{user.name}</span>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-grow flex relative">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-[60] p-4 bg-primary text-primary-foreground rounded-full shadow-xl hover:opacity-90 transition-all cursor-pointer hover:scale-105"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-[55] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-14 left-0 z-[60]
          w-64 bg-background border-r border-border p-4
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          h-[calc(100vh-3.5rem)] overflow-y-auto
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
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}

            {/* Stay Management Section */}
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {t('staffLayout.stayManagement')}
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
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-grow w-full lg:w-auto p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};