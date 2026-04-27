import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Determine the best navigation based on user role and current path
  const getNavigationOptions = () => {
    const options: { label: string; path: string; icon: React.ReactNode }[] = [
      { label: 'Go to Homepage', path: '/', icon: <Home className="w-4 h-4" /> }
    ];

    if (user?.role === 'staff' || user?.role === 'admin') {
      options.push({
        label: 'Go to Dashboard',
        path: user.role === 'admin' ? '/admin/staff' : '/staff/dashboard',
        icon: <Shield className="w-4 h-4" />
      });
    }

    // Add back button if not on root
    if (location.pathname !== '/') {
      options.unshift({
        label: 'Go Back',
        path: '',
        icon: <ArrowLeft className="w-4 h-4" />
      });
    }

    return options;
  };

  const navigationOptions = getNavigationOptions();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-2xl font-bold mt-4 mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {navigationOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                if (option.path) {
                  navigate(option.path);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-80 transition-opacity cursor-pointer"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};