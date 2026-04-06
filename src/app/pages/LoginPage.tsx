import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success(t('loginPage.loginSuccess'));
        if (result.user?.role === 'staff') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setHasError(true);
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info(t('loginPage.forgotPasswordMsg'));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="bg-background rounded-2xl shadow-2xl p-8 border border-border">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{t('loginPage.welcomeBack')}</h2>
          <p className="text-muted-foreground">{t('loginPage.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('loginPage.emailAddress')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="email" 
                required
                placeholder={t('loginPage.emailPlaceholder')}
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('loginPage.password')}</label>
              <button type="button" onClick={handleForgotPassword} className="text-xs text-primary font-medium hover:underline cursor-pointer hover:opacity-80">{t('loginPage.forgotPassword')}</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {hasError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {t('loginPage.incorrectCredentials')}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-80 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? t('loginPage.signingIn') : t('loginPage.signIn')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {t('loginPage.noAccount')}
            <button 
              onClick={() => navigate('/register')}
              className="ml-1 text-primary font-bold hover:underline cursor-pointer hover:opacity-80"
            >
              {t('loginPage.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};