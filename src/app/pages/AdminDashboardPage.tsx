import React, { useState, useEffect } from 'react';
import { AdminPanel } from '../components/AdminPanel';
import { Room, RoomPackage } from '../components/RoomCard';
import { roomsAPI, adminAPI, getErrorMessage, Booking, DashboardStats } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [roomsData, bookingsData, statsData] = await Promise.all([
        roomsAPI.list(),
        adminAPI.bookings(),
        adminAPI.stats(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.error');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      await roomsAPI.update(parseInt(roomId), {
        price: updates.price,
        image_url: updates.image_url || undefined,
        size: updates.size || undefined,
        occupancy: updates.occupancy || undefined,
        status: updates.status as 'available' | 'unavailable',
        featured: updates.featured
      });
      toast.success(t('common.roomUpdated'));
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.updateFailed');
      toast.error(errorMessage);
    }
  };

  const handleAddPackage = async (_roomId: string, _packageData: RoomPackage) => {
    toast.info(t('common.comingSoon'));
  };

  const handleRemovePackage = async (_roomId: string, _packageId: string) => {
    toast.info(t('common.comingSoon'));
  };

  const handleStatusChange = async (bookingId: number, status: 'confirmed' | 'cancelled') => {
    try {
      await adminAPI.updateBooking(bookingId, { status });
      toast.success(status === 'confirmed' ? t('adminBookings.bookingConfirmed') : t('adminBookings.bookingCancelled'));
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('adminBookings.updateFailed');
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <AdminPanel 
      rooms={rooms}
      bookings={bookings}
      stats={stats}
      onUpdateRoom={handleUpdateRoom}
      onAddPackage={handleAddPackage}
      onRemovePackage={handleRemovePackage}
      onStatusChange={handleStatusChange}
    />
  );
};