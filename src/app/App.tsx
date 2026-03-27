import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import { BookingModal } from './components/BookingModal';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Room, bookingsAPI, getErrorMessage } from './services/api';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { RoomDetailsPage } from './pages/RoomDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountProfilePage } from './pages/AccountProfilePage';
import { AccountBookingsPage } from './pages/AccountBookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRoomsPage } from './pages/AdminRoomsPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';

function AppContent() {
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBookingConfirm = async (details: any) => {
    try {
      await bookingsAPI.create({
        room_id: details.room.id,
        check_in: details.checkIn,
        check_out: details.checkOut,
        package_name: details.package?.name
      });
      
      toast.success('Booking Successful!', {
        description: `Your reservation for ${details.room.name} has been confirmed.`,
      });
      setIsBookingOpen(false);
      setSelectedRoomForBooking(null);
      navigate('/account/bookings');
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Booking failed';
      toast.error(errorMessage);
    }
  };

  const handleBookNow = (room: Room) => {
    if (!user) {
      toast.info('Please log in to book a room');
      navigate('/login');
    } else {
      setSelectedRoomForBooking(room);
      setIsBookingOpen(true);
    }
  };

  return (
    <>
      <Toaster position="top-right" expand={false} richColors />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route 
              path="/" 
              element={<HomePage onBookNow={handleBookNow} />} 
            />
            <Route 
              path="/rooms/:roomId" 
              element={<RoomDetailsPage onBookNow={handleBookNow} />} 
            />
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            <Route 
              path="/register" 
              element={<RegisterPage />} 
            />
          </Route>

          {/* Account Routes - Protected */}
          <Route element={<AccountLayout />}>
            <Route path="/account" element={<Navigate to="/account/profile" replace />} />
            <Route 
              path="/account/profile" 
              element={<AccountProfilePage />} 
            />
            <Route 
              path="/account/bookings" 
              element={<AccountBookingsPage />} 
            />
          </Route>

          {/* Admin Routes - Protected */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route 
              path="/admin/dashboard" 
              element={<AdminDashboardPage />} 
            />
            <Route 
              path="/admin/rooms" 
              element={<AdminRoomsPage />} 
            />
            <Route 
              path="/admin/bookings" 
              element={<AdminBookingsPage />} 
            />
          </Route>
        </Routes>
      </AnimatePresence>

      <BookingModal 
        room={selectedRoomForBooking} 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedRoomForBooking(null);
        }} 
        onConfirm={handleBookingConfirm}
        user={user}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}