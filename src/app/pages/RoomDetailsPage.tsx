import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { RoomDetails } from '../components/RoomDetails';
import { Room } from '../components/RoomCard';
import { roomsAPI, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useTranslation } from 'react-i18next';

interface RoomDetailsPageProps {
  onBookNow: (room: Room) => void;
}

export const RoomDetailsPage = ({ onBookNow }: RoomDetailsPageProps) => {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      fetchRoom(parseInt(roomId));
    }
  }, [roomId]);

  const fetchRoom = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsAPI.getById(id);
      setRoom(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('homePage.loadingRooms');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('homePage.loadingRooms')} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <ErrorMessage message={error} onRetry={() => roomId && fetchRoom(parseInt(roomId))} />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('roomDetails.backToRooms')}</h2>
        <p className="text-muted-foreground mb-8">{t('roomDetails.backToRooms')}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          {t('roomDetails.backToRooms')}
        </button>
      </div>
    );
  }

  return (
    <RoomDetails 
      room={room} 
      onBack={() => navigate('/')} 
      onBookNow={onBookNow}
    />
  );
};
