import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight">GOLDEN MILE</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Redefining luxury hospitality in Hong Kong since 1975. Experience the perfect blend of tradition and modern comfort.
            </p>
            <div className="flex gap-4">
              <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Rooms & Suites</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Dining Experience</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Meetings & Events</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>50 Nathan Road, Tsim Sha Tsui, Kowloon, Hong Kong</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+852 2369 3111</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>reservations@goldenmile.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70 mb-4">Subscribe for exclusive offers and updates.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="flex-1 bg-primary-foreground/10 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary-foreground/30"
              />
              <button className="bg-background text-primary px-4 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
          <p>© 2026 Golden Mile Hong Kong. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground">Terms of Service</a>
            <a href="#" className="hover:text-primary-foreground">Cookie Policy</a>
            <a href="#" className="hover:text-primary-foreground">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
