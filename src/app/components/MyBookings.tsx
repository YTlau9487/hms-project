import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, CreditCard, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { ConfirmationDialog } from './ConfirmationDialog';
import { toast } from 'sonner';
import { Booking as APIBooking } from '../services/api';
import { useTranslation } from 'react-i18next';

interface Booking {
  id: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  package: string;
}

interface MyBookingsProps {
  bookings: APIBooking[];
  onBack: () => void;
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookings = ({ bookings, onBack, onCancelBooking }: MyBookingsProps) => {
  const { t } = useTranslation();
  // Map API bookings to component format
  const mappedBookings: Booking[] = bookings.map(b => ({
    id: b.id.toString(),
    roomName: b.room?.name || 'Unknown Room',
    roomImage: b.room?.image_url || '',
    checkIn: b.check_in,
    checkOut: b.check_out,
    total: b.total_price,
    status: b.status,
    package: b.package_name || 'Room Only'
  }));
  const [cancelDialog, setCancelDialog] = useState<{ isOpen: boolean; bookingId: string; roomName: string }>({
    isOpen: false,
    bookingId: '',
    roomName: '',
  });

  const handleCancelClick = (bookingId: string, roomName: string) => {
    setCancelDialog({ isOpen: true, bookingId, roomName });
  };

  const handleConfirmCancel = () => {
    onCancelBooking(cancelDialog.bookingId);
    toast.success(t('myBookings.cancelSuccess'), {
      description: t('myBookings.cancelSuccessDesc'),
    });
    setCancelDialog({ isOpen: false, bookingId: '', roomName: '' });
  };

  const handleViewReceipt = () => {
    toast.info(t('myBookings.receiptNotAvailable'));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('myBookings.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('myBookings.subtitle')}</p>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-primary hover:underline cursor-pointer"
        >
          {t('myBookings.returnToExploring')}
        </button>
      </div>

      {mappedBookings.length === 0 ? (
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold">{t('myBookings.noBookingsTitle')}</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">
            {t('myBookings.noBookingsSubtitle')}
          </p>
          <button 
            onClick={onBack}
            className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('myBookings.exploreRooms')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {mappedBookings.map((booking) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row"
            >
              <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                <ImageWithFallback 
                  src={booking.roomImage} 
                  alt={booking.roomName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{booking.roomName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t('myBookings.location')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                      {booking.status === 'pending' && <Clock className="w-3 h-3" />}
                      {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {booking.status === 'confirmed' ? t('myBookings.statusConfirmed') : booking.status === 'pending' ? t('myBookings.statusPending') : t('myBookings.statusCancelled')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('myBookings.stayDates')}</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {booking.checkIn} – {booking.checkOut}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('myBookings.totalAmount')}</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        ${booking.total}
                      </p>
                    </div>
                  </div>
                </div>

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {t('myBookings.package')}: <span className="font-bold text-foreground">{booking.package}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelClick(booking.id, booking.roomName)}
                          className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                        >
                          {t('myBookings.cancelBooking')}
                        </button>
                      )}
                      <button 
                        onClick={handleViewReceipt}
                        className="flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all cursor-pointer hover:opacity-80"
                      >
                        {t('myBookings.viewReceipt')} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, bookingId: '', roomName: '' })}
        onConfirm={handleConfirmCancel}
        title={t('myBookings.cancelDialogTitle')}
        description={t('myBookings.cancelDialogDesc', { name: cancelDialog.roomName })}
        confirmText={t('myBookings.cancelDialogConfirm')}
        cancelText={t('myBookings.cancelDialogCancel')}
        variant="destructive"
      />
    </motion.div>
  );
};