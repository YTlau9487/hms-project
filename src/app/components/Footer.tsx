import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export const Footer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterJoin = () => {
    if (user?.role === 'staff') {
      toast.info('Staff accounts cannot subscribe to the newsletter.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      toast.error(t('footer.newsletterError'));
      return;
    }
    // Placeholder - no backend yet
    toast.success(t('footer.newsletterSuccess'));
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight">{t('footer.brand')}</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t('footer.brandDescription')}
            </p>
            <div className="flex gap-4">
              <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors cursor-pointer">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors cursor-pointer">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors cursor-pointer">
                <Twitter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/rooms-and-suites" className="hover:text-primary-foreground transition-colors">{t('footer.roomsAndSuites')}</Link></li>
              <li><Link to="/dining" className="hover:text-primary-foreground transition-colors">{t('footer.diningExperience')}</Link></li>
              <li><Link to="/meetings-events" className="hover:text-primary-foreground transition-colors">{t('footer.meetingsAndEvents')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">{t('footer.contactUs')}</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{t('footer.phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{t('footer.email')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">{t('footer.newsletter')}</h4>
            <p className="text-sm text-primary-foreground/70 mb-4">{t('footer.newsletterSubtitle')}</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder={t('footer.emailPlaceholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNewsletterJoin(); }}
                className="flex-1 bg-primary-foreground/10 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary-foreground/30"
              />
              <button 
                onClick={handleNewsletterJoin}
                className="bg-background text-primary px-4 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                {t('footer.join')}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary-foreground">{t('footer.privacyPolicy')}</Link>
            <Link to="/terms" className="hover:text-primary-foreground">{t('footer.termsOfService')}</Link>
            <Link to="/cookies" className="hover:text-primary-foreground">{t('footer.cookiePolicy')}</Link>
            <Link to="/accessibility" className="hover:text-primary-foreground">{t('footer.accessibility')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};