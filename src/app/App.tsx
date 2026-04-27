import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
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

// Pages - eagerly loaded (critical path)
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

// Pages - lazy loaded (non-critical)
const RoomDetailsPage = lazy(() => import('./pages/RoomDetailsPage').then(m => ({ default: m.RoomDetailsPage })));
const AccountProfilePage = lazy(() => import('./pages/AccountProfilePage').then(m => ({ default: m.AccountProfilePage })));
const AccountBookingsPage = lazy(() => import('./pages/AccountBookingsPage').then(m => ({ default: m.AccountBookingsPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminRoomsPage = lazy(() => import('./pages/AdminRoomsPage').then(m => ({ default: m.AdminRoomsPage })));
const AdminBookingsPage = lazy(() => import('./pages/AdminBookingsPage').then(m => ({ default: m.AdminBookingsPage })));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })));
const StayManagementPage = lazy(() => import('./pages/StayManagementPage').then(m => ({ default: m.StayManagementPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const CookiesPage = lazy(() => import('./pages/CookiesPage').then(m => ({ default: m.CookiesPage })));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const RoomsAndSuitesPage = lazy(() => import('./pages/RoomsAndSuitesPage').then(m => ({ default: m.RoomsAndSuitesPage })));
const DiningPage = lazy(() => import('./pages/DiningPage').then(m => ({ default: m.DiningPage })));
const MeetingsEventsPage = lazy(() => import('./pages/MeetingsEventsPage').then(m => ({ default: m.MeetingsEventsPage })));
const AdminStaffPage = lazy(() => import('./pages/AdminStaffPage').then(m => ({ default: m.AdminStaffPage })));
const StaffRoomsPage = lazy(() => import('./pages/StaffRoomsPage').then(m => ({ default: m.StaffRoomsPage })));
const AvailabilityPage = lazy(() => import('./pages/AvailabilityPage').then(m => ({ default: m.AvailabilityPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading fallback for lazy pages
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground text-sm">Loading page...</p>
    </div>
  </div>
);

function AppContent() {
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

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

  // Check for admin session and redirect if on non-admin page
  useEffect(() => {
    if (!authLoading && user?.role === 'admin' && location.pathname !== '/admin/login' && !location.pathname.startsWith('/admin')) {
      navigate('/admin/staff');
    }
  }, [location.pathname, navigate, authLoading, user]);



  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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
              element={<Suspense fallback={<PageLoader />}><RoomDetailsPage onBookNow={handleBookNow} /></Suspense>} 
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
              element={<Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>} 
            />
            <Route 
              path="/terms" 
              element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} 
            />
            <Route 
              path="/cookies" 
              element={<Suspense fallback={<PageLoader />}><CookiesPage /></Suspense>} 
            />
            <Route 
              path="/accessibility" 
              element={<Suspense fallback={<PageLoader />}><AccessibilityPage /></Suspense>} 
            />
            <Route 
              path="/about" 
              element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} 
            />
            <Route 
              path="/rooms-and-suites" 
              element={<Suspense fallback={<PageLoader />}><RoomsAndSuitesPage /></Suspense>} 
            />
            <Route 
              path="/dining" 
              element={<Suspense fallback={<PageLoader />}><DiningPage /></Suspense>} 
            />
            <Route 
              path="/meetings-events" 
              element={<Suspense fallback={<PageLoader />}><MeetingsEventsPage /></Suspense>} 
            />
            <Route 
              path="/rooms/availability" 
              element={<Suspense fallback={<PageLoader />}><AvailabilityPage /></Suspense>} 
            />
          </Route>

          {/* Account Routes - Protected (Customer only) */}
          <Route element={<AccountLayout />}>
            <Route path="/account" element={<Navigate to="/account/profile" replace />} />
            <Route 
              path="/account/profile" 
              element={<Suspense fallback={<PageLoader />}><AccountProfilePage /></Suspense>} 
            />
            <Route 
              path="/account/bookings" 
              element={<Suspense fallback={<PageLoader />}><AccountBookingsPage /></Suspense>} 
            />
          </Route>

          {/* Staff Routes - Protected */}
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
            <Route 
              path="/staff/dashboard" 
              element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} 
            />
            <Route 
              path="/staff/rooms" 
              element={<Suspense fallback={<PageLoader />}><StaffRoomsPage /></Suspense>} 
            />
            <Route 
              path="/staff/bookings" 
              element={<Suspense fallback={<PageLoader />}><AdminBookingsPage /></Suspense>} 
            />
            <Route 
              path="/staff/stay-management/:action" 
              element={<Suspense fallback={<PageLoader />}><StayManagementPage /></Suspense>} 
            />
          </Route>

          {/* Admin Routes - Protected */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/staff" replace />} />
            <Route 
              path="/admin/rooms" 
              element={<Suspense fallback={<PageLoader />}><AdminRoomsPage /></Suspense>} 
            />
            <Route 
              path="/admin/staff" 
              element={<Suspense fallback={<PageLoader />}><AdminStaffPage /></Suspense>} 
            />
            <Route 
              path="/admin/notifications" 
              element={<Suspense fallback={<PageLoader />}><AdminNotificationsPage /></Suspense>} 
            />
          </Route>


          {/* Admin Login Route */}
          <Route 
            path="/admin/login" 
            element={<AdminLoginPage />} 
          />

          {/* 404 Catch-All Route - must be last */}
          <Route 
            path="*" 
            element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} 
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
    <HelmetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HelmetProvider>
  );
}
