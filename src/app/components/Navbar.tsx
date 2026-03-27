import React from 'react';
import { Menu, User, LogIn, LogOut, Bell, ShieldCheck, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

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
    const newLang = i18n.language === 'en' ? 'zh-TW' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" 
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-primary-foreground font-bold">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight">{t('navbar.brand')}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('navbar.rooms')}
              </button>
              {user && (
                <>
                  <button 
                    onClick={() => navigate('/account/bookings')}
                    className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${isActive('/account/bookings') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t('navbar.myBookings')}
                  </button>
                  <button 
                    onClick={() => navigate('/account/profile')}
                    className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${isActive('/account/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t('navbar.myProfile')}
                  </button>
                </>
              )}
              <button className="px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {t('navbar.amenities')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={i18n.language === 'en' ? 'Switch to Chinese' : '切換至英文'}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">{i18n.language === 'en' ? 'EN' : '繁'}</span>
            </button>

            {user?.role === 'staff' && (
              <button 
                onClick={() => {
                  if (location.pathname.startsWith('/admin')) {
                    navigate('/');
                  } else {
                    navigate('/admin/dashboard');
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-90"
              >
                <ShieldCheck className="w-4 h-4" />
                {location.pathname.startsWith('/admin') ? t('navbar.customerView') : t('navbar.staffDashboard')}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <div className="flex items-center gap-2 pl-4 border-l border-border">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
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
              <button 
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              >
                {t('navbar.rooms')}
              </button>
              {user && (
                <>
                  <button 
                    onClick={() => {
                      navigate('/account/bookings');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${isActive('/account/bookings') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  >
                    {t('navbar.myBookings')}
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/account/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${isActive('/account/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  >
                    {t('navbar.myProfile')}
                  </button>
                </>
              )}
              <button className="block w-full text-left px-3 py-2 rounded-lg text-base font-bold text-muted-foreground">
                {t('navbar.amenities')}
              </button>
              {!user && (
                <button 
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold"
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