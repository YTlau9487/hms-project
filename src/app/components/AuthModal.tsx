import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    role: 'customer'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock successful auth
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || (formData.email === 'admin@hotel.com' ? 'Admin Staff' : 'John Doe'),
      email: formData.email,
      phone: formData.phone || '+852 1234 5678',
      age: formData.age || '30',
      role: formData.email === 'admin@hotel.com' ? 'staff' : 'customer'
    };
    onSuccess(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border"
      >
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {mode === 'login' ? t('authModal.welcomeBack') : t('authModal.createAccount')}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login' ? t('authModal.loginSubtitle') : t('authModal.registerSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('authModal.fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    required
                    placeholder={t('authModal.fullNamePlaceholder')}
                    className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('authModal.emailAddress')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  placeholder={t('authModal.emailPlaceholder')}
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('authModal.phoneNumber')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="tel" 
                      required
                      placeholder={t('authModal.phonePlaceholder')}
                      className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('authModal.age')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="number" 
                      required
                      min="18"
                      max="120"
                      placeholder={t('authModal.agePlaceholder')}
                      className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('authModal.ageNote')}</p>
                </div>
              </>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">{t('authModal.password')}</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-primary font-medium hover:underline cursor-pointer hover:opacity-80">{t('authModal.forgotPassword')}</button>
                )}
              </div>
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
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-80 transition-opacity mt-2 cursor-pointer"
            >
              {mode === 'login' ? t('authModal.signIn') : t('authModal.createAccountBtn')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? t('authModal.noAccount') : t('authModal.alreadyAccount')}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-primary font-bold hover:underline"
              >
                {mode === 'login' ? t('authModal.register') : t('authModal.login')}
              </button>
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-accent rounded-lg text-[10px] text-accent-foreground/70 leading-relaxed text-center">
            {t('authModal.staffTip')} <span className="font-bold">admin@hotel.com</span> {t('authModal.staffTipEnd')}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
