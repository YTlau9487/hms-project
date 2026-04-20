import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { roomsAPI, Room, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BedDouble, Wifi, Users, Maximize } from 'lucide-react';

export const StaffRoomsPage = () => {
  const { t, i18n } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [i18n.language]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsAPI.list({ lang: i18n.language });
      setRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.loadingFailed');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRooms} />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('staffRooms.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('staffRooms.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-background rounded-xl border border-border overflow-hidden">
            {room.image_url && (
              <img 
                src={room.image_url} 
                alt={room.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{room.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.status === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {room.status === 'available' ? t('staffRooms.available') : t('staffRooms.unavailable')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{room.description}</p>
              
               <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                 {room.size_sqm && (
                   <div className="flex items-center gap-1">
                     <Maximize className="w-3 h-3" />
                     <span>{room.size_sqm} {t('staffRooms.sqm')}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-1">
                   <Users className="w-3 h-3" />
                   <span>{room.adults} {t('staffRooms.adults')}{room.children > 0 ? `, ${room.children} ${t('staffRooms.children')}` : ''}</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Wifi className="w-3 h-3" />
                   <span>{t('staffRooms.wifi')}</span>
                 </div>
               </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-lg font-bold">${room.price}</span>
                <span className="text-sm text-muted-foreground">{t('staffRooms.perNight')}</span>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t('staffRooms.amenities')}</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="px-2 py-1 bg-muted rounded-full text-xs">
                        +{room.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};