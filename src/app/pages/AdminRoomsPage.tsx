import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room } from '../components/RoomCard';
import { roomsAPI, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface RoomFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  size: string;
  occupancy: string;
  amenities: string;
  status: 'available' | 'occupied' | 'maintenance';
  featured: boolean;
}

const emptyForm: RoomFormData = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  size: '',
  occupancy: '',
  amenities: '',
  status: 'available',
  featured: false,
};

export const AdminRoomsPage = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; roomId: number; roomName: string }>({
    isOpen: false,
    roomId: 0,
    roomName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

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
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('homePage.loadingRooms');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      price: room.price,
      image_url: room.image_url || '',
      size: room.size || '',
      occupancy: room.occupancy || '',
      amenities: room.amenities || '',
      status: room.status,
      featured: room.featured,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || formData.price <= 0) {
      toast.error('Room name and price are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom.id, formData);
        toast.success('Room updated successfully');
      } else {
        await roomsAPI.create(formData);
        toast.success('Room created successfully');
      }
      setModalOpen(false);
      await fetchRooms();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to save room';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (room: Room) => {
    setDeleteDialog({ isOpen: true, roomId: room.id, roomName: room.name });
  };

  const handleConfirmDelete = async () => {
    try {
      await roomsAPI.delete(deleteDialog.roomId);
      toast.success('Room deleted successfully');
      await fetchRooms();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to delete room';
      toast.error(errorMessage);
    }
    setDeleteDialog({ isOpen: false, roomId: 0, roomName: '' });
  };

  if (isLoading) {
    return <LoadingSpinner message={t('homePage.loadingRooms')} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRooms} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('adminRooms.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('adminRooms.subtitle')}</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('adminRooms.addRoom')}
        </button>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminRooms.room')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminRooms.type')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminRooms.price')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminRooms.status')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t('adminRooms.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rooms.length === 0 ? (
              <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      {t('adminRooms.noRoomsFound')}
                    </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {room.image_url ? (
                          <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No img</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <p className="text-sm text-muted-foreground">{room.size || 'N/A'} • {room.occupancy || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {room.featured ? t('adminRooms.featured') : t('adminRooms.standard')}
                    </span>
                  </td>
                    <td className="px-6 py-4 font-medium">${room.price}{t('adminRooms.perNight')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.status === 'available' 
                        ? 'bg-green-100 text-green-700' 
                        : room.status === 'maintenance'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {room.status === 'available' ? t('adminRooms.available') : room.status === 'maintenance' ? t('adminRooms.maintenance') : t('adminRooms.occupied')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(room)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer hover:opacity-80"
                        title={t('adminRooms.editRoom')}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(room)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                        title={t('adminRooms.deleteRoom')}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-2xl font-bold">
                    {editingRoom ? `${t('adminRooms.editRoomTitle')}: ${editingRoom.name}` : t('adminRooms.createNewRoom')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {editingRoom ? t('adminRooms.updateRoomSpecs') : t('adminRooms.fillRoomDetails')}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer hover:opacity-80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.roomName')} *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('adminRooms.roomNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.pricePerNight')} *</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.size')}</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('adminRooms.sizePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.occupancy')}</label>
                    <input
                      type="text"
                      value={formData.occupancy}
                      onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('adminRooms.occupancyPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.roomStatus')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomFormData['status'] })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="available">{t('adminRooms.available')}</option>
                      <option value="occupied">{t('adminRooms.occupied')}</option>
                      <option value="maintenance">{t('adminRooms.maintenance')}</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold">{t('adminRooms.featuredRoom')}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">{t('adminRooms.imageUrl')}</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('adminRooms.imageUrlPlaceholder')}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">{t('adminRooms.amenities')}</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('adminRooms.amenitiesPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('adminRooms.amenitiesNote')}</p>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">{t('adminRooms.description')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                    placeholder={t('adminRooms.descriptionPlaceholder')}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? t('adminRooms.saving') : editingRoom ? t('adminRooms.saveChanges') : t('adminRooms.createRoom')}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 bg-muted text-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {t('adminRooms.cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, roomId: 0, roomName: '' })}
        onConfirm={handleConfirmDelete}
        title={t('adminRooms.deleteRoomTitle')}
        description={t('adminRooms.deleteRoomDesc', { name: deleteDialog.roomName })}
        confirmText={t('adminRooms.deleteRoomBtn')}
        cancelText={t('adminRooms.cancel')}
        variant="destructive"
      />
    </div>
  );
};