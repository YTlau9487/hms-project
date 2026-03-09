import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
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
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Enter your credentials to access your account' : 'Join our membership for exclusive benefits'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe"
                    className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+852 1234 5678"
                      className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="number" 
                      required
                      min="18"
                      max="120"
                      placeholder="18"
                      className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Must be 18 or older to book</p>
                </div>
              </>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-primary font-medium hover:underline">Forgot password?</button>
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
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-accent rounded-lg text-[10px] text-accent-foreground/70 leading-relaxed text-center">
            Tip: Use <span className="font-bold">admin@hotel.com</span> to log in as Staff
          </div>
        </div>
      </motion.div>
    </div>
  );
};
