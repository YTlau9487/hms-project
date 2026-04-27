import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MyBookings } from '../components/MyBookings';
import { bookingsAPI, getErrorMessage, Booking, PaginatedResponse } from '../services/api';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: PaginatedResponse<Booking> = await bookingsAPI.my(undefined, page, pageSize);
      setBookings(data.items);
      setTotalPages(data.pages);
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
      toast.success(t('myBookings.cancelSuccess'));
      // Refresh bookings list
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('myBookings.cancelFailed');
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
    <div>
      <MyBookings 
        bookings={bookings}
        onBack={() => {
          if (user?.role === 'staff') {
            navigate('/?view=customer');
          } else {
            navigate('/');
          }
        }}
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
          >
            {t('common.previous', { defaultValue: 'Previous' })}
          </button>
          <span className="text-sm text-muted-foreground px-4">
            {t('common.pageOf', { defaultValue: 'Page {{current}} of {{total}}', current: page, total: totalPages })}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
          >
            {t('common.next', { defaultValue: 'Next' })}
          </button>
        </div>
      )}
    </div>
  );
};