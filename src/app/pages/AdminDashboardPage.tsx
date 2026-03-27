import React, { useState, useEffect } from 'react';
import { AdminPanel } from '../components/AdminPanel';
import { Room, RoomPackage } from '../components/RoomCard';
import { roomsAPI, adminAPI, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { toast } from 'sonner';

export const AdminDashboardPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsAPI.list();
      setRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : '無法取得房型資料';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      await roomsAPI.update(parseInt(roomId), {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image_url: updates.image_url,
        size: updates.size,
        occupancy: updates.occupancy,
        amenities: Array.isArray(updates.amenities) ? updates.amenities.join(',') : updates.amenities,
        status: updates.status as 'available' | 'occupied' | 'maintenance',
        featured: updates.featured
      });
      toast.success('Room updated successfully');
      await fetchRooms();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to update room';
      toast.error(errorMessage);
    }
  };

  const handleAddPackage = async (roomId: string, packageData: RoomPackage) => {
    // Note: Backend doesn't have package support yet
    toast.info('Package management coming soon');
  };

  const handleRemovePackage = async (roomId: string, packageId: string) => {
    // Note: Backend doesn't have package support yet
    toast.info('Package management coming soon');
  };

  if (isLoading) {
    return <LoadingSpinner message="載入管理面板中..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <ErrorMessage message={error} onRetry={fetchRooms} />
      </div>
    );
  }

  return (
    <AdminPanel 
      rooms={rooms}
      onUpdateRoom={handleUpdateRoom}
      onAddPackage={handleAddPackage}
      onRemovePackage={handleRemovePackage}
    />
  );
};
