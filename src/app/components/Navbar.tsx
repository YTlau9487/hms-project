import React from 'react';
import { Menu, User, LogIn, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: any;
  onAuthClick: () => void;
  onLogout: () => void;
  view: 'customer' | 'staff';
  setView: (view: 'customer' | 'staff') => void;
  customerView: 'home' | 'my-bookings' | 'profile';
  setCustomerView: (view: 'home' | 'my-bookings' | 'profile') => void;
  onProfileClick: () => void;
}

export const Navbar = ({ user, onAuthClick, onLogout, view, setView, customerView, setCustomerView, onProfileClick }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" 
              onClick={() => {
                setView('customer');
                setCustomerView('home');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-primary-foreground font-bold">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight">GOLDEN MILE</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => {
                  setView('customer');
                  setCustomerView('home');
                }}
                className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${view === 'customer' && customerView === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Rooms
              </button>
              {user && (
                <>
                  <button 
                    onClick={() => {
                      setView('customer');
                      setCustomerView('my-bookings');
                    }}
                    className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${view === 'customer' && customerView === 'my-bookings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    My Bookings
                  </button>
                  <button 
                    onClick={onProfileClick}
                    className={`px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${view === 'customer' && customerView === 'profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    My Profile
                  </button>
                </>
              )}
              <button className="px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Amenities
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'staff' && (
              <button 
                onClick={() => {
                  setView(view === 'staff' ? 'customer' : 'staff');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-90"
              >
                <ShieldCheck className="w-4 h-4" />
                {view === 'staff' ? 'Customer View' : 'Staff Dashboard'}
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
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
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
                  setView('customer');
                  setCustomerView('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${customerView === 'home' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              >
                Rooms
              </button>
              {user && (
                <>
                  <button 
                    onClick={() => {
                      setView('customer');
                      setCustomerView('my-bookings');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${customerView === 'my-bookings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  >
                    My Bookings
                  </button>
                  <button 
                    onClick={() => {
                      onProfileClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${customerView === 'profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  >
                    My Profile
                  </button>
                </>
              )}
              <button className="block w-full text-left px-3 py-2 rounded-lg text-base font-bold text-muted-foreground">
                Amenities
              </button>
              {!user && (
                <button 
                  onClick={() => {
                    onAuthClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold"
                >
                  Login / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
