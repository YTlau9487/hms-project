import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MyBookings } from '../components/MyBookings';
import { bookingsAPI, getErrorMessage, Booking } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { toast } from 'sonner';

export const AccountBookingsPage = () => {
  const navigate = useNavigate();
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
      const errorMessage = err instanceof Error ? getErrorMessage(err) : '無法取得訂單資料';
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
    return <LoadingSpinner message="載入訂單資料中..." />;
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
      onBack={() => navigate('/')}
      onCancelBooking={handleCancelBooking}
    />
  );
};
