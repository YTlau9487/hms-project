import React from 'react';
import { Menu, User, LogIn, LogOut, Bell, ShieldCheck, Languages, Eye, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    const langs = ['en', 'zh-TW', 'zh-CN'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoomsClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/rooms');
    } else if (user?.role === 'staff') {
      sessionStorage.setItem('interfaceContext', 'customer');
      navigate('/?view=customer');
    } else {
      navigate('/');
    }
    scrollToTop();
  };

  const handleAmenitiesClick = () => {
    toast.info(t('common.comingSoon'));
  };


  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" 
              onClick={() => {
                if (user?.role === 'staff' && !location.pathname.startsWith('/staff')) {
                  sessionStorage.setItem('interfaceContext', 'customer');
                  navigate('/?view=customer');
                } else {
                  navigate('/');
                }
                setIsMobileMenuOpen(false);
                scrollToTop();
              }}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-primary-foreground font-bold">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight truncate">{t('navbar.brand')}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {user?.role !== 'staff' && (
                <>
                  <button 
                    onClick={handleRoomsClick}
                    className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t('navbar.rooms')}
                  </button>
                  {user && (
                    <>
                      <button 
                        onClick={() => { navigate('/account/bookings'); setTimeout(scrollToTop, 50); }}
                        className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${isActive('/account/bookings') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {t('navbar.myBookings')}
                      </button>
                      <button 
                        onClick={() => { navigate('/account/profile'); setTimeout(scrollToTop, 50); }}
                        className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${isActive('/account/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {t('navbar.myProfile')}
                      </button>
                    </>
                  )}
                  <button 
                    onClick={handleAmenitiesClick}
                    className="px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t('navbar.amenities')}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer whitespace-nowrap"
              title={i18n.language === 'en' ? '切換至繁體中文' : i18n.language === 'zh-TW' ? '切換至简体中文' : 'Switch to English'}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline">{i18n.language === 'en' ? 'EN' : i18n.language === 'zh-TW' ? '繁' : '简'}</span>
            </button>

            {user?.role === 'staff' && (
              <button 
                onClick={() => {
                  if (location.pathname.startsWith('/staff')) {
                    sessionStorage.setItem('interfaceContext', 'customer');
                    navigate('/?view=customer');
                  } else {
                    sessionStorage.removeItem('interfaceContext');
                    navigate('/staff/dashboard');
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  location.pathname.startsWith('/staff')
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                }`}
                title={location.pathname.startsWith('/staff') ? 'Switch to customer browsing view' : 'Switch to staff management dashboard'}
              >
                {location.pathname.startsWith('/staff') ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('navbar.customerView')}</span>
                    <span className="sm:hidden">Customer</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('navbar.staffDashboard')}</span>
                    <span className="sm:hidden">Staff</span>
                  </>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pl-4 border-l border-border">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role === 'customer' ? t('navbar.customer') : t('navbar.staff')}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer hover:opacity-80"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('navbar.login')}</span>
              </button>
            )}
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {user?.role !== 'staff' && (
                <>
                  <button 
                    onClick={() => {
                      handleRoomsClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold cursor-pointer hover:opacity-80 ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  >
                    {t('navbar.rooms')}
                  </button>
                  {user && (
                    <>
                      <button 
                        onClick={() => {
                          navigate('/account/bookings');
                          setIsMobileMenuOpen(false);
                          setTimeout(scrollToTop, 100);
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold cursor-pointer hover:opacity-80 ${isActive('/account/bookings') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                      >
                        {t('navbar.myBookings')}
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/account/profile');
                          setIsMobileMenuOpen(false);
                          setTimeout(scrollToTop, 100);
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold cursor-pointer hover:opacity-80 ${isActive('/account/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                      >
                        {t('navbar.myProfile')}
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      handleAmenitiesClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-bold text-muted-foreground cursor-pointer hover:opacity-80"
                  >
                    {t('navbar.amenities')}
                  </button>
                </>
              )}
              {!user && (
                <button 
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold cursor-pointer hover:opacity-80"
                >
                  {t('navbar.loginRegister')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};