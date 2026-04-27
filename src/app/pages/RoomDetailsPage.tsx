import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
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
  const { t, i18n } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      fetchRoom(parseInt(roomId));
    }
  }, [roomId, i18n.language]);

  const fetchRoom = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsAPI.getById(id, i18n.language);
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

  // Check sessionStorage for interface context (set by Navbar when staff switches views)
  const isCustomerView = sessionStorage.getItem('interfaceContext') === 'customer';
  const handleBackToRooms = () => {
    navigate(isCustomerView ? '/?view=customer' : '/');
    setTimeout(() => {
      const element = document.getElementById('rooms-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('roomDetails.backToRooms')}</h2>
        <p className="text-muted-foreground mb-8">{t('roomDetails.backToRooms')}</p>
        <button 
          onClick={handleBackToRooms}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          {t('roomDetails.backToRooms')}
        </button>
      </div>
    );
  }

  return (
    <>
      {room && (
        <Helmet>
          <title>{room.name} — Golden Mile Hotel</title>
          <meta name="description" content={room.description} />
          <link rel="canonical" href={`https://hotel.ytlau.net/rooms/${room.id}`} />
          <meta property="og:title" content={`${room.name} — Golden Mile Hotel`} />
          <meta property="og:description" content={room.description} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://hotel.ytlau.net/rooms/${room.id}`} />
          <meta property="og:image" content={room.image_url || 'https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080'} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${room.name} — Golden Mile Hotel`} />
          <meta name="twitter:description" content={room.description} />
          <meta name="twitter:image" content={room.image_url || 'https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080'} />
        </Helmet>
      )}
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <RoomDetails
        room={room}
        onBack={handleBackToRooms}
        onBookNow={onBookNow}
      />
    </motion.div>
    </>
  );
};
