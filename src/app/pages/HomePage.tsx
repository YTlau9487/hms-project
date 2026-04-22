import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { EnhancedHero } from '../components/EnhancedHero';
import { RoomCard, Room } from '../components/RoomCard';
import { toast } from 'sonner';
import { roomsAPI, availabilityAPI, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onBookNow: (room: Room) => void;
}

export const HomePage = ({ onBookNow }: HomePageProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Redirect staff users to admin dashboard (unless they explicitly chose customer view)
  useEffect(() => {
    if (user?.role === 'staff' && searchParams.get('view') !== 'customer') {
      navigate('/admin/staff');

    }
  }, [user, navigate, searchParams]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [activeFilter, setActiveFilter] = useState(t('homePage.allRooms'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [i18n.language]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsAPI.list({ status: 'available', lang: i18n.language });
      setRooms(data);
      setAllRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('homePage.loadingRooms');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredRoom = rooms.find(room => room.featured && room.status === 'available') || null;

  const filteredRooms = rooms.filter(room => {
    if (room.status !== 'available') {
      return false;
    }
    
    if (activeFilter === t('homePage.allRooms')) {
      return true;
    }
    
    // Map filter labels to room types
    const filterToRoomType: Record<string, string> = {
      [t('homePage.luxury')]: 'luxury',
      [t('homePage.suite')]: 'suite',
      [t('homePage.business')]: 'business',
    };
    
    const roomType = filterToRoomType[activeFilter];
    return roomType ? room.room_type === roomType : true;
  });

  const handleViewDetails = (room: Room) => {
    navigate(`/rooms/${room.id}`);
  };

  const handleViewFeatured = () => {
    if (featuredRoom) {
      navigate(`/rooms/${featuredRoom.id}`);
    }
  };

  const handleSearch = async (params: { checkIn: string; checkOut: string; adults: number; children: number }) => {
    try {
      setIsLoading(true);
      const data = await availabilityAPI.check(params.checkIn, params.checkOut, i18n.language);
      setRooms(data.rooms);
      setActiveFilter(t('homePage.allRooms'));
      
      toast.success(t('homePage.searchSuccess', { count: data.rooms.length }));
      
      // Scroll to rooms section
      setTimeout(() => {
        const element = document.getElementById('rooms-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('homePage.searchError');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('homePage.loadingRooms')} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRooms} />;
  }

  return (
    <>
      <EnhancedHero 
        onBookNow={() => {
          const element = document.getElementById('rooms-section');
          element?.scrollIntoView({ behavior: 'smooth' });
        }} 
        onSearch={handleSearch}
        featuredRoom={featuredRoom}
        onViewFeatured={handleViewFeatured}
      />
      
      <section id="rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-4">{t('homePage.ourCuratedRooms')}</h2>
            <p className="text-muted-foreground max-w-xl">
              {t('homePage.roomsSubtitle')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[t('homePage.allRooms'), t('homePage.luxury'), t('homePage.suite'), t('homePage.business')].map((filter) => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full border text-sm font-bold transition-all cursor-pointer ${
                  activeFilter === filter 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <RoomCard
                  room={room}
                  onViewDetails={handleViewDetails}
                  onBookNow={onBookNow}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              {t('homePage.noRoomsFound')}
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities-section" className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('homePage.worldClassFacilities')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('homePage.facilitiesSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => toast.info(t('homePage.facilityComingSoon'))}
            >
              <img src="https://images.unsplash.com/photo-1769638913569-40fc740b44f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGJyZWFrZmFzdCUyMGJ1ZmZldCUyMHNlbGVjdGlvbiUyMGZyZXNoJTIwZm9vZHxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Dining" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-xl font-bold mb-2">{t('homePage.exquisiteDining')}</h3>
                <p className="text-sm opacity-80">{t('homePage.exquisiteDiningDesc')}</p>
              </div>
            </div>
            <div 
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => toast.info(t('homePage.facilityComingSoon'))}
            >
              <img src="https://images.unsplash.com/photo-1761049862641-16616dea7b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHNwYSUyMHdlbGxuZXNzJTIwY2VudGVyJTIwcG9vbHxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Spa" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-xl font-bold mb-2">{t('homePage.wellnessAndSpa')}</h3>
                <p className="text-sm opacity-80">{t('homePage.wellnessAndSpaDesc')}</p>
              </div>
            </div>
            <div 
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => toast.info(t('homePage.facilityComingSoon'))}
            >
              <img src="https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Lobby" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-xl font-bold mb-2">{t('homePage.luxuryLounge')}</h3>
                <p className="text-sm opacity-80">{t('homePage.luxuryLoungeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};