import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Users, ArrowLeft } from 'lucide-react';
import { PAGE_SEO } from '../utils/seo';
import { RoomCard, Room } from '../components/RoomCard';
import { availabilityAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

export const AvailabilityPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse search params
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined;

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    if (i18n.language.startsWith('zh')) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Search for availability
  const searchAvailability = async (ci: string, co: string, g?: number) => {
    if (!ci || !co) {
      setError('Please select both check-in and check-out dates');
      return;
    }
    if (co <= ci) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await availabilityAPI.check(ci, co, i18n.language);
      setResults(response.rooms);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to search for rooms');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial search on mount
  useEffect(() => {
    if (checkIn && checkOut) {
      searchAvailability(checkIn, checkOut, guests);
    } else {
      setError('Please select check-in and check-out dates');
    }
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const ci = formData.get('check_in') as string;
    const co = formData.get('check_out') as string;
    const g = formData.get('guests') as string;

    if (!ci || !co) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    // Update URL params
    const params = new URLSearchParams();
    params.set('check_in', ci);
    params.set('check_out', co);
    if (g) params.set('guests', g);
    setSearchParams(params);

    searchAvailability(ci, co, g ? parseInt(g) : undefined);
  };

  // Handle booking from results - navigate to room detail with dates
  const handleBookNow = (room: Room) => {
    navigate(`/rooms/${room.id}?check_in=${checkIn}&check_out=${checkOut}`);
  };

  // Handle view details - navigate to room detail
  const handleViewDetails = (room: Room) => {
    navigate(`/rooms/${room.id}?check_in=${checkIn}&check_out=${checkOut}`);
  };

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.availability.title}</title>
        <meta name="description" content={PAGE_SEO.availability.description} />
        <link rel="canonical" href={PAGE_SEO.availability.canonical} />
      </Helmet>
      <div className="min-h-screen bg-background">
      {/* Search Form Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('roomDetails.backToRooms')}
          </button>
          <h1 className="text-2xl font-bold mb-4">{t('hero.checkAvailability')}</h1>
          
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">{t('hero.checkIn')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  name="check_in"
                  defaultValue={checkIn}
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">{t('hero.checkOut')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  name="check_out"
                  defaultValue={checkOut}
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="w-[150px]">
              <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">{t('hero.guests')}</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  name="guests"
                  defaultValue={guests || ''}
                  className="w-full bg-input-background border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t('hero.checkAvailability')}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Summary */}
        {checkIn && checkOut && (
          <div className="mb-6 p-4 bg-muted/20 rounded-lg border border-border">
            <div className="flex flex-wrap gap-4 text-sm">
              <span><strong>{t('hero.checkIn')}:</strong> {formatDate(checkIn)}</span>
              <span><strong>{t('hero.checkOut')}:</strong> {formatDate(checkOut)}</span>
              {nights > 0 && <span><strong>{nights} {nights === 1 ? 'night' : 'nights'}</strong></span>}
              {guests && <span><strong>{guests} {guests === 1 ? 'guest' : 'guests'}</strong></span>}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">{t('homePage.loadingRooms')}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-80 cursor-pointer"
            >
              {t('homePage.exploreRooms')}
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && results.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {t('homePage.searchSuccess', { count: results.length })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onViewDetails={handleViewDetails}
                  onBookNow={handleBookNow}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && checkIn && checkOut && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No rooms available</h3>
            <p className="text-muted-foreground mb-6">
              No rooms are available for your selected dates. Please try different dates.
            </p>
            <button
              onClick={() => navigate('/rooms')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-80 cursor-pointer"
            >
              {t('homePage.exploreRooms')}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
