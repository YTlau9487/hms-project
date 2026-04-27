import React, { useState, useEffect } from 'react';
import { CalendarCheck, LogIn, LogOut, Search, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI, bookingsAPI, getErrorMessage, Booking } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

type StayAction = 'check-in' | 'check-out';

export const StayManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { action } = useParams<{ action: StayAction }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: number;
    guestName: string;
  }>({ isOpen: false, bookingId: 0, guestName: '' });

  useEffect(() => {
    fetchBookings();
  }, [i18n.language]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch all bookings with max allowed page size for stay management (backend max is 50)
      const data = await adminAPI.bookings(i18n.language, 1, 50);
      setBookings(data.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('stayManagement.loadingError');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (bookingId: number) => {
    try {
      if (action === 'check-in') {
        await bookingsAPI.checkIn(bookingId);
        toast.success(t('stayManagement.checkInSuccess'));
      } else if (action === 'check-out') {
        await bookingsAPI.checkOut(bookingId);
        toast.success(t('stayManagement.checkOutSuccess'));
      }
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('stayManagement.actionFailed');
      toast.error(errorMessage);
    }
    setConfirmDialog({ isOpen: false, bookingId: 0, guestName: '' });
  };

  const getGuestName = (booking: Booking) => {
    const name = booking.user?.name?.trim();
    if (name) return name;
    const email = booking.user?.email?.trim();
    if (email) return email;
    return `User #${booking.user_id}`;
  };

  const canCheckIn = (booking: Booking) => {
    return booking.status === 'confirmed' && !booking.checked_in_at;
  };

  const canCheckOut = (booking: Booking) => {
    return booking.checked_in_at !== null && !booking.checked_out_at;
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const guestName = getGuestName(booking).toLowerCase();
    return (
      `bk-${booking.id}`.includes(query) ||
      guestName.includes(query) ||
      (booking.room?.name || '').toLowerCase().includes(query)
    );
  });

  const eligibleBookings = filteredBookings.filter(booking => {
    if (action === 'check-in') return canCheckIn(booking);
    if (action === 'check-out') return canCheckOut(booking);
    return false;
  });

  const isCheckIn = action === 'check-in';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {isCheckIn ? <LogIn className="w-8 h-8 text-green-600" /> : <LogOut className="w-8 h-8 text-red-600" />}
            {isCheckIn ? t('stayManagement.checkInTitle') : t('stayManagement.checkOutTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isCheckIn ? t('stayManagement.checkInSubtitle') : t('stayManagement.checkOutSubtitle')}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('stayManagement.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.bookingId')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.guest')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.room')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.checkInDate')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.checkOutDate')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.status')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.stayStatus')}</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('stayManagement.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <LoadingSpinner message={t('stayManagement.loadingBookings')} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <ErrorMessage message={error} onRetry={fetchBookings} />
                  </td>
                </tr>
              ) : eligibleBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    {isCheckIn ? t('stayManagement.noCheckInBookings') : t('stayManagement.noCheckOutBookings')}
                  </td>
                </tr>
              ) : (
                eligibleBookings.map((booking) => (
                  <tr key={booking.id} className="text-sm hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">BK-{booking.id}</td>
                    <td className="px-6 py-4">{getGuestName(booking)}</td>
                    <td className="px-6 py-4">{booking.room?.room_type ? t(`staffRooms.roomTypes.${booking.room.room_type}`, { defaultValue: booking.room.room_type }) : t('stayManagement.unknownRoom')}</td>
                    <td className="px-6 py-4">{booking.check_in}</td>
                    <td className="px-6 py-4">{booking.check_out}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status === 'confirmed' ? t('stayManagement.confirmed') : booking.status === 'pending' ? t('stayManagement.pending') : t('stayManagement.cancelled')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {booking.checked_in_at ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                            {t('stayManagement.checkedIn')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                            {t('stayManagement.notCheckedIn')}
                          </span>
                        )}
                        {booking.checked_out_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 whitespace-nowrap">
                            {t('stayManagement.checkedOut')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, guestName: getGuestName(booking) })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isCheckIn
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {isCheckIn ? t('stayManagement.checkInBtn') : t('stayManagement.checkOutBtn')}
                      </button>
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
              <LoadingSpinner message={t('stayManagement.loadingBookings')} />
            </div>
          ) : error ? (
            <div className="bg-background rounded-xl border border-border p-8 text-center">
              <ErrorMessage message={error} onRetry={fetchBookings} />
            </div>
          ) : eligibleBookings.length === 0 ? (
            <div className="bg-background rounded-xl border border-border p-8 text-center text-muted-foreground">
              {isCheckIn ? t('stayManagement.noCheckInBookings') : t('stayManagement.noCheckOutBookings')}
            </div>
          ) : (
            eligibleBookings.map((booking) => (
              <div key={booking.id} className="bg-background rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-bold">BK-{booking.id}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status === 'confirmed' ? t('stayManagement.confirmed') : booking.status === 'pending' ? t('stayManagement.pending') : t('stayManagement.cancelled')}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">{getGuestName(booking)}</div>
                  <div className="text-sm text-muted-foreground">{booking.room?.room_type ? t(`staffRooms.roomTypes.${booking.room.room_type}`, { defaultValue: booking.room.room_type }) : t('stayManagement.unknownRoom')}</div>
                  <div className="text-sm">{booking.check_in} – {booking.check_out}</div>
                </div>
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, guestName: getGuestName(booking) })}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isCheckIn
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isCheckIn ? t('stayManagement.checkInBtn') : t('stayManagement.checkOutBtn')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => handleAction(confirmDialog.bookingId)}
        title={isCheckIn ? t('stayManagement.confirmCheckInTitle') : t('stayManagement.confirmCheckOutTitle')}
        description={isCheckIn
          ? t('stayManagement.confirmCheckInDesc', { guest: confirmDialog.guestName })
          : t('stayManagement.confirmCheckOutDesc', { guest: confirmDialog.guestName })
        }
        confirmText={isCheckIn ? t('stayManagement.checkInBtn') : t('stayManagement.checkOutBtn')}
        cancelText={t('stayManagement.goBack')}
        variant={isCheckIn ? 'default' : 'destructive'}
        icon={isCheckIn ? CheckCircle : XCircle}
        iconColor={isCheckIn ? 'text-green-600' : 'text-red-600'}
        iconBgColor={isCheckIn ? 'bg-green-100' : 'bg-red-100'}
        confirmButtonClassName={isCheckIn ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
      />
    </div>
  );
};