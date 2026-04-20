import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { BookingModal } from './components/BookingModal';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Room, bookingsAPI, getErrorMessage } from './services/api';

// Global scroll-to-top component that triggers on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { StaffLayout } from './layouts/StaffLayout';

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
import { AdminNotificationsPage } from './pages/AdminNotificationsPage';
import { StayManagementPage } from './pages/StayManagementPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiesPage } from './pages/CookiesPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { AboutPage } from './pages/AboutPage';
import { RoomsAndSuitesPage } from './pages/RoomsAndSuitesPage';
import { DiningPage } from './pages/DiningPage';
import { MeetingsEventsPage } from './pages/MeetingsEventsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { StaffRoomsPage } from './pages/StaffRoomsPage';

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
    if (user?.role === 'staff') {
      toast.info('Staff accounts cannot book rooms. Please use the admin dashboard.');
      return;
    }
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
      <ScrollToTop />
      <Toaster position="top-right" expand={false} richColors offset={80} />
      
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
            <Route 
              path="/privacy" 
              element={<PrivacyPage />} 
            />
            <Route 
              path="/terms" 
              element={<TermsPage />} 
            />
            <Route 
              path="/cookies" 
              element={<CookiesPage />} 
            />
            <Route 
              path="/accessibility" 
              element={<AccessibilityPage />} 
            />
            <Route 
              path="/about" 
              element={<AboutPage />} 
            />
            <Route 
              path="/rooms-and-suites" 
              element={<RoomsAndSuitesPage />} 
            />
            <Route 
              path="/dining" 
              element={<DiningPage />} 
            />
            <Route 
              path="/meetings-events" 
              element={<MeetingsEventsPage />} 
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

          {/* Staff Routes - Protected */}
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
            <Route 
              path="/staff/dashboard" 
              element={<AdminDashboardPage />} 
            />
            <Route 
              path="/staff/rooms" 
              element={<StaffRoomsPage />} 
            />
            <Route 
              path="/staff/bookings" 
              element={<AdminBookingsPage />} 
            />
            <Route 
              path="/staff/stay-management/:action" 
              element={<StayManagementPage />} 
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
              path="/admin/staff" 
              element={<AdminStaffPage />} 
            />
            <Route 
              path="/admin/notifications" 
              element={<AdminNotificationsPage />} 
            />
            <Route 
              path="/admin/bookings" 
              element={<AdminBookingsPage />} 
            />
          </Route>

          {/* Admin Login Route */}
          <Route 
            path="/admin/login" 
            element={<AdminLoginPage />} 
          />
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