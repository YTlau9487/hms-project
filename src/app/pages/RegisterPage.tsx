import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, user } = useAuth();
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password
      });
      
      if (result.success) {
        toast.success(t('registerPage.registerSuccess'));
        // After successful registration, user is auto-logged in via login() call in register()
        // The user state will be updated, so we can check user.role
        if (user?.role === 'staff') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.error || t('registerPage.registerFailed'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('registerPage.registerFailed');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="bg-background rounded-2xl shadow-2xl p-8 border border-border">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{t('registerPage.createAccount')}</h2>
          <p className="text-muted-foreground">{t('registerPage.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('registerPage.fullName')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                required
                placeholder={t('registerPage.fullNamePlaceholder')}
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('registerPage.emailAddress')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="email" 
                required
                placeholder={t('registerPage.emailPlaceholder')}
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('registerPage.phoneNumber')}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="tel" 
                required
                placeholder={t('registerPage.phonePlaceholder')}
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('registerPage.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-80 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? t('registerPage.creating') : t('registerPage.createAccountBtn')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {t('registerPage.alreadyAccount')}
            <button 
              onClick={() => navigate('/login')}
              className="ml-1 text-primary font-bold hover:underline"
            >
              {t('registerPage.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};