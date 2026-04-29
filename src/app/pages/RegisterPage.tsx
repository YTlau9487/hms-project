import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, User, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { PAGE_SEO } from '../utils/seo';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import PhoneInput from '../components/PhoneInput';
import { parsePhoneNumber } from 'libphonenumber-js';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, user } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'staff') {
        navigate('/admin/staff');

      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasLetter: false,
    hasDigit: false,
    noSpaces: true,
  });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    setPasswordChecks({
      minLength: formData.password.length >= 8,
      hasLetter: /[A-Za-z]/.test(formData.password),
      hasDigit: /\d/.test(formData.password),
      noSpaces: !formData.password.includes(' '),
    });
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    setErrorMessage('');
    
    // Frontend validation
    if (!formData.first_name.trim() || formData.first_name.trim().length < 1) {
      setHasError(true);
      setErrorMessage(t('registerPage.firstNameMinLength'));
      return;
    }
    
    if (!formData.last_name.trim() || formData.last_name.trim().length < 1) {
      setHasError(true);
      setErrorMessage(t('registerPage.lastNameMinLength'));
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setHasError(true);
      setErrorMessage(t('registerPage.invalidEmail'));
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setHasError(true);
      setErrorMessage(t('registerPage.passwordMinLength'));
      return;
    }

    if (formData.password.includes(' ')) {
      setHasError(true);
      setErrorMessage(t('registerPage.passwordNoSpaces'));
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setHasError(true);
      setErrorMessage(t('registerPage.passwordMinLength'));
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setHasError(true);
      setErrorMessage(t('registerPage.passwordMismatch'));
      return;
    }
    
    // Validate phone number using libphonenumber-js
    if (!formData.phone || formData.phone.trim().length === 0) {
      setHasError(true);
      setErrorMessage(t('registerPage.phoneRequired'));
      return;
    }
    
    try {
      const parsedPhone = parsePhoneNumber(formData.phone);
      if (!parsedPhone || !parsedPhone.isValid()) {
        setHasError(true);
        setErrorMessage(t('registerPage.phoneInvalid'));
        return;
      }
    } catch {
      setHasError(true);
      setErrorMessage(t('registerPage.phoneInvalid'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password
      });
      
      if (result.success) {
        toast.success(t('registerPage.registerSuccess'));
        // After successful registration, user is auto-logged in via login() call in register()
        // The user state will be updated, so we can check user.role
        if (user?.role === 'staff') {
          navigate('/admin/staff');

        } else {
          navigate('/');
        }
      } else {
        setHasError(true);
        setErrorMessage(result.error || t('registerPage.registerFailed'));
      }
    } catch (err) {
      setHasError(true);
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('registerPage.registerFailed');
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.register.title}</title>
        <meta name="description" content={PAGE_SEO.register.description} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-md mx-auto px-4 py-24">
      <div className="bg-background rounded-2xl shadow-2xl p-8 border border-border">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{t('registerPage.createAccount')}</h2>
          <p className="text-muted-foreground">{t('registerPage.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('registerPage.firstName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  placeholder={t('registerPage.firstNamePlaceholder')}
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('registerPage.lastName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  placeholder={t('registerPage.lastNamePlaceholder')}
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
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
            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData({...formData, phone: value || ''})}
              placeholder={t('registerPage.phonePlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('registerPage.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-12 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.minLength ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                <span className={passwordChecks.minLength ? 'text-green-600' : 'text-muted-foreground'}>{t('registerPage.passwordCheckLength')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.hasLetter ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                <span className={passwordChecks.hasLetter ? 'text-green-600' : 'text-muted-foreground'}>{t('registerPage.passwordCheckLetter')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.hasDigit ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                <span className={passwordChecks.hasDigit ? 'text-green-600' : 'text-muted-foreground'}>{t('registerPage.passwordCheckDigit')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.noSpaces ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                <span className={passwordChecks.noSpaces ? 'text-green-600' : 'text-muted-foreground'}>{t('registerPage.passwordCheckNoSpaces')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('registerPage.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-input-background border-none rounded-lg pl-10 pr-12 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {hasError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {errorMessage}
            </div>
          )}

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
              className="ml-1 text-primary font-bold hover:underline cursor-pointer hover:opacity-80"
            >
              {t('registerPage.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};
