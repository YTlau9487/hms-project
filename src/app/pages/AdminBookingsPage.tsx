import React, { useState, useEffect } from 'react';
import { CalendarCheck, Eye, X, Check } from 'lucide-react';
import { adminAPI, getErrorMessage, Booking } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const AdminBookingsPage = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: number;
    action: 'confirm' | 'cancel';
    guestName: string;
  }>({ isOpen: false, bookingId: 0, action: 'cancel', guestName: '' });

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
      toast.success(status === 'confirmed' ? t('adminBookings.bookingConfirmed') : t('adminBookings.bookingCancelled'));
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('adminBookings.updateFailed');
      toast.error(errorMessage);
    }
    setConfirmDialog({ isOpen: false, bookingId: 0, action: 'cancel', guestName: '' });
  };

  const handleViewDetails = (booking: Booking) => {
    toast.info(t('common.comingSoon'));
  };

  const getGuestName = (booking: Booking) => {
    const name = booking.user?.name?.trim();
    if (name) return name;
    const email = booking.user?.email?.trim();
    if (email) return email;
    return `User #${booking.user_id}`;
  };

  const canCancel = (booking: Booking) => {
    return booking.status !== 'cancelled' && !booking.checked_in_at && !booking.checked_out_at;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('adminBookings.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('adminBookings.subtitle')}</p>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.bookingId')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.guest')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.room')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.checkIn')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.checkOut')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.status')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.total')}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminBookings.actions')}</th>
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
                <tr key={booking.id} className="text-sm hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">BK-{booking.id}</td>
                  <td className="px-6 py-4">{getGuestName(booking)}</td>
                  <td className="px-6 py-4">{booking.room?.name || 'Unknown Room'}</td>
                  <td className="px-6 py-4">{booking.check_in}</td>
                  <td className="px-6 py-4">{booking.check_out}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : booking.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'confirmed' ? t('adminBookings.confirmed') : booking.status === 'pending' ? t('adminBookings.pending') : t('adminBookings.cancelled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">${booking.total_price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer" 
                        title={t('adminBookings.viewDetails')}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'confirm', guestName: getGuestName(booking) })}
                          className="p-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer" 
                          title={t('adminBookings.confirm')}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      {canCancel(booking) && (
                        <button 
                          onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'cancel', guestName: getGuestName(booking) })}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer" 
                          title={t('adminBookings.cancel')}
                        >
                          <X className="w-4 h-4 text-destructive" />
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
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {isLoading ? (
            <div className="bg-background rounded-xl border border-border p-8 text-center">
              <LoadingSpinner message={t('adminBookings.loadingBookings')} />
            </div>
          ) : error ? (
            <div className="bg-background rounded-xl border border-border p-8 text-center">
              <ErrorMessage message={error} onRetry={fetchBookings} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-background rounded-xl border border-border p-8 text-center text-muted-foreground">
              {t('adminBookings.noBookingsFound')}
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-background rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-bold">BK-{booking.id}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status === 'confirmed' ? t('adminBookings.confirmed') : booking.status === 'pending' ? t('adminBookings.pending') : t('adminBookings.cancelled')}
                  </span>
                </div>

                {/* Content Area */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium">{getGuestName(booking)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground pl-6">
                    {booking.room?.name || 'Unknown Room'}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-6 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">{t('adminBookings.checkIn')}</span>
                      <div className="font-medium">{booking.check_in}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">{t('adminBookings.checkOut')}</span>
                      <div className="font-medium">{booking.check_out}</div>
                    </div>
                  </div>
                  <div className="pl-6 pt-1">
                    <span className="font-semibold text-lg">${booking.total_price}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                  <button 
                    onClick={() => handleViewDetails(booking)}
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {t('adminBookings.viewDetails')}
                  </button>
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'confirm', guestName: getGuestName(booking) })}
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      {t('adminBookings.confirm')}
                    </button>
                  )}
                  {canCancel(booking) && (
                    <button 
                      onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'cancel', guestName: getGuestName(booking) })}
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      {t('adminBookings.cancel')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, bookingId: 0, action: 'cancel', guestName: '' })}
        onConfirm={() => {
          handleUpdateStatus(confirmDialog.bookingId, confirmDialog.action === 'confirm' ? 'confirmed' : 'cancelled');
        }}
        title={
          confirmDialog.action === 'confirm' ? t('adminPanel.confirmBooking') :
          t('adminPanel.cancelBooking')
        }
        description={
          confirmDialog.action === 'confirm' ? t('adminPanel.confirmBookingDesc', { id: confirmDialog.bookingId }) :
          t('adminPanel.cancelBookingDesc', { id: confirmDialog.bookingId })
        }
        confirmText={
          confirmDialog.action === 'confirm' ? t('adminPanel.confirmBookingBtn') :
          t('adminPanel.cancelBookingBtn')
        }
        cancelText={t('adminPanel.goBack')}
        variant={confirmDialog.action === 'cancel' ? 'destructive' : 'default'}
      />
    </div>
  );
};