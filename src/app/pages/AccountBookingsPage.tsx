import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MyBookings } from '../components/MyBookings';
import { bookingsAPI, getErrorMessage, Booking } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const AccountBookingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingsAPI.my();
      setBookings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('adminBookings.loadingError');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.cancel(parseInt(bookingId));
      toast.success('Booking cancelled successfully');
      // Refresh bookings list
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to cancel booking';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('adminBookings.loadingBookings')} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <ErrorMessage message={error} onRetry={fetchBookings} />
      </div>
    );
  }

  return (
    <MyBookings 
      bookings={bookings}
      onBack={() => {
        if (user?.role === 'staff') {
          navigate('/?view=customer');
        } else {
          navigate('/');
        }
      }}
      onCancelBooking={handleCancelBooking}
    />
  );
};
