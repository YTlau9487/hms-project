import React, { useState } from 'react';
import { Search, Calendar, Users, ArrowRight, Sparkles, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ImageWithFallback } from './ImageWithFallback';
import { Room } from './RoomCard';

interface EnhancedHeroProps {
  onBookNow: () => void;
  onSearch: (params: { checkIn: string; checkOut: string; adults: number; children: number }) => void;
  featuredRoom?: Room | null;
  onViewFeatured?: () => void;
}

// Calculate min check-out date (must be strictly after check-in)
const getMinCheckOut = (checkInDate: string) => {
  if (checkInDate) {
    const date = new Date(checkInDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  return '';
};

export const EnhancedHero = ({ onBookNow, onSearch, featuredRoom, onViewFeatured }: EnhancedHeroProps) => {
  const { t, i18n } = useTranslation();
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Initialize dates dynamically: check-in = tomorrow, check-out = tomorrow + 2 days
  const getDefaultDates = () => {
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 2);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
    };
  };
  
  const [searchParams, setSearchParams] = React.useState({
    checkIn: getDefaultDates().checkIn,
    checkOut: getDefaultDates().checkOut,
    adults: 2,
    children: 0
  });
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const handleSearch = () => {
    // Validate dates
    if (!searchParams.checkIn || !searchParams.checkOut) {
      setDateError(t('hero.dateErrorRequired'));
      return;
    }
    if (searchParams.checkOut <= searchParams.checkIn) {
      setDateError(t('hero.dateErrorInvalid'));
      return;
    }
    setDateError(null);
    // Feature not yet implemented - show toast
    toast.info(t('common.comingSoon'));
  };

  const handleCheckInChange = (value: string) => {
    setDateError(null);
    setSearchParams(prev => {
      // If check-out is same as or before new check-in, auto-adjust check-out to check-in + 1 day
      let newCheckOut = prev.checkOut;
      if (value && (!prev.checkOut || prev.checkOut <= value)) {
        newCheckOut = getMinCheckOut(value);
      }
      return { ...prev, checkIn: value, checkOut: newCheckOut };
    });
  };

  // Use featured room or default image
  const heroImage = featuredRoom?.image_url || 'https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080';

  return (
    <div className="relative w-full min-h-[60vh] md:min-h-[65vh] mb-6 md:mb-8">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <ImageWithFallback
          src={heroImage}
          alt={featuredRoom ? featuredRoom.name : "Luxury Hotel"}
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-12 md:pb-16 flex flex-col items-start">
        {/* Promotional Content */}
        {featuredRoom ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white pb-12"
          >
            {/* Promotional Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent/90 backdrop-blur-sm text-accent-foreground px-4 py-2 rounded-full mb-6 font-bold text-sm shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {t('hero.badge')}
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
              {t('hero.titleLine1')} <br />
              <span className="text-accent-foreground bg-accent px-3 py-1.5 inline-block -rotate-1 mt-2">
                {featuredRoom.name}
              </span>
            </h1>
            
            <p className="text-base md:text-lg mb-5 text-gray-200 font-light max-w-xl">
              {featuredRoom.description}
            </p>

            {/* Featured Room Highlights */}
            <div className="flex flex-wrap gap-3 mb-6">
              {featuredRoom.size_sqm && (
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <span className="text-xs font-semibold">{t('roomCard.sizeLabel', { value: featuredRoom.size_sqm })}</span>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                <span className="text-xs font-semibold">
                  {t('roomCard.adults', { count: featuredRoom.adults })}
                  {featuredRoom.children > 0 && `, ${t('roomCard.children', { count: featuredRoom.children })}`}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                <span className="text-xs font-semibold">{t('hero.startingFrom', { price: featuredRoom.price })}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={onViewFeatured}
                className="px-6 py-3 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:scale-105 transition-transform shadow-xl cursor-pointer flex items-center gap-2"
              >
                {t('hero.viewOffers')} <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={onBookNow}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-base font-semibold rounded-lg hover:bg-white/20 transition-all shadow-xl cursor-pointer"
              >
                {t('hero.exploreRooms')}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white pb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
              {t('hero.titleFallback1')} <br />
              <span className="text-accent-foreground bg-accent px-3 py-1.5 inline-block -rotate-1 mt-2">
                {t('hero.titleFallback2')}
              </span>
            </h1>
            <p className="text-base md:text-lg mb-6 text-gray-200 font-light max-w-lg">
              {t('hero.subtitleFallback')}
            </p>
            <button 
              onClick={onBookNow}
              className="px-6 py-3 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:scale-105 transition-transform shadow-xl cursor-pointer"
            >
              {t('hero.bookYourStay')}
            </button>
          </motion.div>
        )}

        {/* Search Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full bg-background rounded-xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 border border-border mt-6 md:mt-8"
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
                onChange={(e) => handleCheckInChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
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
                onChange={(e) => {
                  setSearchParams({ ...searchParams, checkOut: e.target.value });
                  setDateError(null);
                }}
                min={searchParams.checkIn ? getMinCheckOut(searchParams.checkIn) : new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> {t('hero.guests')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(!showGuestSelector)}
                  className="w-full bg-input-background border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary text-left flex items-center justify-between"
                >
                  <span>
                    {t('roomCard.adults', { count: searchParams.adults })}
                    {searchParams.children > 0 && `, ${t('roomCard.children', { count: searchParams.children })}`}
                  </span>
                </button>
                {showGuestSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-4 z-20">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('roomCard.adults', { count: 1 })}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSearchParams(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-sm">{searchParams.adults}</span>
                          <button
                            type="button"
                            onClick={() => setSearchParams(prev => ({ ...prev, adults: Math.min(6, prev.adults + 1) }))}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('roomCard.children', { count: 1 })}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSearchParams(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-sm">{searchParams.children}</span>
                          <button
                            type="button"
                            onClick={() => setSearchParams(prev => ({ ...prev, children: Math.min(4, prev.children + 1) }))}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
        {dateError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm"
          >
            {dateError}
          </motion.div>
        )}
      </div>
    </div>
  );
};