import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';
import { LayoutDashboard, BedDouble, CalendarCheck, Menu, X, Users, Bell, Shield, LogOut, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ADMIN_IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const ADMIN_WARNING_TIMEOUT = 4 * 60 * 1000; // 4 minutes (1 minute warning)

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimeLeft, setWarningTimeLeft] = useState(60);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setWarningTimeLeft(60);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/admin/login';
  }, [logout]);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let warningTimer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    const startTimers = () => {
      resetTimer();
      
      // Show warning after 4 minutes
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setWarningTimeLeft(60);
        
        // Countdown for last 60 seconds
        countdownInterval = setInterval(() => {
          setWarningTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, ADMIN_WARNING_TIMEOUT);

      // Auto-logout after 5 minutes
      idleTimer = setTimeout(() => {
        handleLogout();
      }, ADMIN_IDLE_TIMEOUT);
    };

    startTimers();

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      startTimers();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [handleLogout, resetTimer]);

  // Show loading state while AuthContext initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Route guard: redirect to login if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Prevent admins from accessing customer root page
  if (user.role === 'admin' && location.pathname === '/') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const managementItems = [
    { path: '/admin/rooms', label: t('adminLayout.rooms'), icon: BedDouble },
    { path: '/admin/staff', label: t('adminLayout.staff'), icon: Users },
    { path: '/admin/notifications', label: t('adminLayout.notifications'), icon: Bell },
  ];


  const toggleLanguage = () => {
    const langs = ['en', 'zh-TW', 'zh-CN'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  return (

    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary bg-gray-50">
      {/* Admin Header - Unique design */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <span className="text-lg font-bold">{t('adminLayout.title')}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
            title={i18n.language === 'en' ? '切換至繁體中文' : i18n.language === 'zh-TW' ? '切換至简体中文' : 'Switch to English'}
          >
            <Languages className="w-4 h-4" />
            <span className="hidden md:inline">{i18n.language === 'en' ? 'EN' : i18n.language === 'zh-TW' ? '繁' : '简'}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 whitespace-nowrap">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-grow flex relative">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-[60] p-4 bg-gray-900 text-white rounded-full shadow-xl hover:opacity-90 transition-all cursor-pointer hover:scale-105"
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
          w-64 bg-white border-r border-gray-200 p-4
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          h-[calc(100vh-3.5rem)] overflow-y-auto
        `}>
          <div className="lg:hidden flex justify-end mb-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-2">
            <div className="space-y-2">
              <p className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                {t('adminLayout.management')}
              </p>
              {managementItems.map((item) => {
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
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>



          {/* Auto-logout warning */}
          {showWarning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium">
                {t('adminLayout.sessionExpires')} {warningTimeLeft}s
              </p>
              <button
                onClick={resetTimer}
                className="mt-2 w-full px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded hover:bg-yellow-200 transition-colors cursor-pointer"
              >
                {t('adminLayout.stayLoggedIn')}
              </button>
            </div>
          )}
        </aside>
        
        {/* Main content */}
        <main className="flex-grow w-full lg:w-auto p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};