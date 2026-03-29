import React, { useState, useEffect } from 'react';
import { CalendarCheck, Eye, X, Check } from 'lucide-react';
import { adminAPI, getErrorMessage, Booking } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const AdminBookingsPage = () => {
  const { t } = useTranslation();
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
      const data = await adminAPI.bookings();
      setBookings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('adminBookings.loadingError');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: 'confirmed' | 'cancelled') => {
    try {
      await adminAPI.updateBooking(bookingId, { status });
      toast.success(`Booking ${status} successfully`);
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to update booking';
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('adminBookings.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('adminBookings.subtitle')}</p>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.bookingId')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.guest')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.room')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.checkIn')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.checkOut')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.status')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.total')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminBookings.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <LoadingSpinner message={t('adminBookings.loadingBookings')} />
                    </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <ErrorMessage message={error} onRetry={fetchBookings} />
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      {t('adminBookings.noBookingsFound')}
                    </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">BK-{booking.id}</td>
                  <td className="px-6 py-4">User #{booking.user_id}</td>
                  <td className="px-6 py-4">{booking.room?.name || 'Unknown Room'}</td>
                  <td className="px-6 py-4">{booking.check_in}</td>
                  <td className="px-6 py-4">{booking.check_out}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'confirmed' ? t('adminBookings.confirmed') : booking.status === 'pending' ? t('adminBookings.pending') : t('adminBookings.cancelled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">${booking.total_price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer hover:opacity-80" title={t('adminBookings.viewDetails')}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors cursor-pointer hover:opacity-80" 
                          title={t('adminBookings.confirm')}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors cursor-pointer hover:opacity-80" 
                          title={t('adminBookings.cancel')}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};