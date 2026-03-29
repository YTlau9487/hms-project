import React, { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  Upload, 
  Save, 
  Image as ImageIcon,
  DollarSign,
  FileText,
  Settings as SettingsIcon,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room, RoomPackage } from './RoomCard';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ManageRoomsProps {
  rooms: Room[];
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void;
  onAddPackage: (roomId: string, packageData: RoomPackage) => void;
  onRemovePackage: (roomId: string, packageId: string) => void;
}

export const ManageRooms = ({ rooms, onUpdateRoom, onAddPackage, onRemovePackage }: ManageRoomsProps) => {
  const { t } = useTranslation();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Room>>({});
  const [newPackage, setNewPackage] = useState<Partial<RoomPackage>>({});
  const [showPackageForm, setShowPackageForm] = useState(false);

  const handleEditClick = (room: Room) => {
    setEditingRoom(room);
    setEditFormData(room);
  };

  const handleSaveRoom = () => {
    if (editingRoom) {
      onUpdateRoom(String(editingRoom.id), editFormData);
      toast.success('Room updated successfully!');
      setEditingRoom(null);
      setEditFormData({});
    }
  };

  const handleAddPackage = () => {
    if (editingRoom && newPackage.name && newPackage.description && newPackage.priceMultiplier !== undefined) {
      const packageData: RoomPackage = {
        id: `pkg-${Date.now()}`,
        name: newPackage.name,
        description: newPackage.description,
        priceMultiplier: newPackage.priceMultiplier / 100,
      };
      onAddPackage(String(editingRoom.id), packageData);
      toast.success(`Package "${packageData.name}" added!`);
      setNewPackage({});
      setShowPackageForm(false);
    } else {
      toast.error('Please fill in all package fields');
    }
  };

  const handleImageUpload = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1590490359854-dfba19688d70?w=1080',
      'https://images.unsplash.com/photo-1759221793465-4795ba2eaafc?w=1080',
      'https://images.unsplash.com/photo-1767091116911-afd6612c53c6?w=1080',
      'https://images.unsplash.com/photo-1761049862641-16616dea7b32?w=1080',
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setEditFormData({ ...editFormData, image_url: randomImage });
    toast.success('Image uploaded successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('manageRooms.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('manageRooms.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            layout
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={room.image_url || ''}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  room.status === 'available' 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-orange-500/90 text-white'
                }`}>
                  {room.status === 'available' ? t('manageRooms.available') : room.status === 'maintenance' ? t('manageRooms.maintenance') : t('manageRooms.occupied')}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">{room.featured ? t('manageRooms.featuredRoom') : t('manageRooms.standardRoom')}</p>
                </div>
                <span className="text-2xl font-bold text-primary">${room.price}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>

              <button
                onClick={() => handleEditClick(room)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {t('manageRooms.editRoomDetails')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-2xl font-bold">{t('manageRooms.editRoom')}: {editingRoom.name}</h3>
                  <p className="text-sm text-muted-foreground">{t('manageRooms.updateRoomSpecs')}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setEditFormData({});
                    setShowPackageForm(false);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer hover:opacity-80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Image Section */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3">
                    <ImageIcon className="w-4 h-4" /> {t('manageRooms.roomPhoto')}
                  </label>
                  <div className="relative h-64 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 group cursor-pointer" onClick={handleImageUpload}>
                    <ImageWithFallback
                      src={editFormData.image_url || editingRoom.image_url || ''}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white">
                        <Upload className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-bold">{t('manageRooms.clickToUpload')}</p>
                        <p className="text-xs opacity-80">{t('manageRooms.highQualityRecommended')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <FileText className="w-4 h-4" /> {t('manageRooms.roomName')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <DollarSign className="w-4 h-4" /> {t('manageRooms.basePrice')}
                    </label>
                    <input
                      type="number"
                      value={editFormData.price || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <Tag className="w-4 h-4" /> {t('manageRooms.size')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.size || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('manageRooms.sizePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <SettingsIcon className="w-4 h-4" /> {t('manageRooms.roomStatus')}
                    </label>
                    <select
                      value={editFormData.status || 'available'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'available' | 'occupied' | 'maintenance' })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="available">{t('manageRooms.available')}</option>
                      <option value="occupied">{t('manageRooms.occupied')}</option>
                      <option value="maintenance">{t('manageRooms.maintenance')}</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <FileText className="w-4 h-4" /> {t('manageRooms.roomDescription')}
                  </label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                    placeholder={t('manageRooms.descriptionPlaceholder')}
                  />
                </div>

                {/* Packages Section */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{t('manageRooms.roomPackages')}</h4>
                      <p className="text-xs text-muted-foreground">{t('manageRooms.addServiceBundles')}</p>
                    </div>
                    <button
                      onClick={() => setShowPackageForm(!showPackageForm)}
                      className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('manageRooms.addPackage')}
                    </button>
                  </div>

                  {/* Add Package Form */}
                  {showPackageForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-accent/10 rounded-lg border border-accent/30 space-y-4 mb-4"
                    >
                      <h5 className="font-bold text-sm">{t('manageRooms.newPackageDetails')}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold mb-1 block">{t('manageRooms.packageName')}</label>
                          <input
                            type="text"
                            placeholder={t('manageRooms.packageNamePlaceholder')}
                            value={newPackage.name || ''}
                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold mb-1 block">{t('manageRooms.priceIncrease')}</label>
                          <input
                            type="number"
                            placeholder={t('manageRooms.priceIncreasePlaceholder')}
                            value={newPackage.priceMultiplier || ''}
                            onChange={(e) => setNewPackage({ ...newPackage, priceMultiplier: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold mb-1 block">{t('manageRooms.packageDescription')}</label>
                        <textarea
                          placeholder={t('manageRooms.packageDescriptionPlaceholder')}
                          value={newPackage.description || ''}
                          onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                      {newPackage.priceMultiplier && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-xs font-semibold text-primary">
                            {t('manageRooms.finalPrice')}: ${(editingRoom.price + (editingRoom.price * (newPackage.priceMultiplier / 100))).toFixed(2)} {t('manageRooms.perNight')}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddPackage}
                          className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('manageRooms.addPackageBtn')}
                        </button>
                        <button
                          onClick={() => {
                            setShowPackageForm(false);
                            setNewPackage({});
                          }}
                          className="px-4 py-2 bg-muted text-foreground rounded-lg font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-4">
                <button
                  onClick={handleSaveRoom}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('manageRooms.saveChanges')}
                </button>
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setEditFormData({});
                    setShowPackageForm(false);
                  }}
                  className="px-6 py-3 bg-muted text-foreground rounded-lg font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};