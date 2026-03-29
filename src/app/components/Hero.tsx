import React from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { useTranslation } from 'react-i18next';

interface HeroProps {
  onBookNow: () => void;
  onSearch: (params: { checkIn: string; checkOut: string; guests: string }) => void;
}

export const Hero = ({ onBookNow, onSearch }: HeroProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = React.useState({
    checkIn: '2026-02-12',
    checkOut: '2026-02-14',
    guests: t('hero.guestOption1')
  });

  const handleSearch = () => {
    onSearch(searchParams);
  };

  return (
    <div className="relative h-[80vh] w-full mb-16 md:mb-24">
      {/* Hero Background - Overflow hidden moved here to keep panel visible */}
      <div className="absolute inset-0 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Luxury Hotel Lobby"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-white pb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            {t('hero.titleFallback1')} <br />
            <span className="text-accent-foreground bg-accent px-4 py-1 inline-block -rotate-1 mt-2">
              {t('hero.titleFallback2')}
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 font-light max-w-lg">
            {t('hero.subtitleFallback')}
          </p>
          <button 
            onClick={onBookNow}
            className="px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-lg hover:scale-105 transition-transform shadow-xl cursor-pointer"
          >
            {t('hero.bookYourStay')}
          </button>
        </motion.div>

        {/* Search Panel Overlay - Now visible outside the container */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute -bottom-12 md:-bottom-16 left-4 right-4 md:left-8 md:right-8 bg-background rounded-xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-4 border border-border z-20"
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {t('hero.checkIn')}
              </label>
              <input 
                type="date" 
                className="w-full bg-input-background border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {t('hero.checkOut')}
              </label>
              <input 
                type="date" 
                className="w-full bg-input-background border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> {t('hero.guests')}
              </label>
              <select 
                className="w-full bg-input-background border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
              >
                <option>{t('hero.guestOption1')}</option>
                <option>{t('hero.guestOption2')}</option>
                <option>{t('hero.guestOption3')}</option>
                <option>{t('hero.guestOption4')}</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleSearch}
            className="md:w-48 bg-primary text-primary-foreground rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Search className="w-5 h-5" />
            {t('hero.checkAvailability')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
