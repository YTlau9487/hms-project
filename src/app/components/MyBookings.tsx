import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, CreditCard, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { ConfirmationDialog } from './ConfirmationDialog';
import { toast } from 'sonner';

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
  bookings: Booking[];
  onBack: () => void;
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookings = ({ bookings, onBack, onCancelBooking }: MyBookingsProps) => {
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
    toast.success('Booking cancelled successfully', {
      description: 'You will receive a confirmation email shortly.',
    });
    setCancelDialog({ isOpen: false, bookingId: '', roomName: '' });
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Reservations</h1>
          <p className="text-muted-foreground mt-2">Manage your upcoming and past stays at Golden Mile.</p>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-primary hover:underline cursor-pointer"
        >
          Return to Exploring
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold">No Bookings Found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">
            You haven't made any reservations yet. Start planning your urban escape today!
          </p>
          <button 
            onClick={onBack}
            className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Explore Rooms
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
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
                        <MapPin className="w-3 h-3" /> Tsim Sha Tsui, Hong Kong
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
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stay Dates</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {booking.checkIn} – {booking.checkOut}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        ${booking.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Package: <span className="font-bold text-foreground">{booking.package}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => handleCancelClick(booking.id, booking.roomName)}
                        className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                    <button className="flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
                      View Receipt <ChevronRight className="w-4 h-4" />
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
        title="Cancel Booking"
        description={`Are you sure you want to cancel your reservation for ${cancelDialog.roomName}? This action cannot be undone. You will receive a refund according to our cancellation policy.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        variant="destructive"
      />
    </motion.div>
  );
};
