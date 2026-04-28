import React, { useState, useEffect } from 'react';
import {
  Edit2,
  Plus,
  X,
  Save,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Settings as SettingsIcon,
  Tag,
  CheckCircle,
  Globe,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room, RoomPackage } from './RoomCard';
import { roomsAPI, RoomAdminData, RoomTranslationData, AmenityTranslationData, getErrorMessage } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ManageRoomsProps {
  rooms: Room[];
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void;
  onAddPackage: (roomId: string, packageData: RoomPackage) => void;
  onRemovePackage: (roomId: string, packageId: string) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'zh-TW', label: '繁體', fullLabel: '繁體中文' },
  { code: 'zh-CN', label: '简体', fullLabel: '简体中文' },
];

export const ManageRooms = ({ rooms, onUpdateRoom, onAddPackage, onRemovePackage }: ManageRoomsProps) => {
  const { t } = useTranslation();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Room>>({});
  const [roomAdminData, setRoomAdminData] = useState<RoomAdminData | null>(null);
  const [activeLangTab, setActiveLangTab] = useState('en');
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  const handleEditClick = async (room: Room) => {
    setEditingRoom(room);
    setEditFormData(room);
    setIsLoadingAdmin(true);
    try {
      const adminData = await roomsAPI.getByIdAdmin(room.id);
      setRoomAdminData(adminData);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.loadingFailed');
      toast.error(errorMessage);
      setRoomAdminData(null);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const [newImageUrl, setNewImageUrl] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleSaveRoom = async () => {
    if (!editingRoom || !roomAdminData) return;

    // Validate at least one image
    if (roomAdminData.images.length === 0) {
      toast.error(t('manageRooms.imageRequiredError'));
      return;
    }

    try {
      await roomsAPI.update(editingRoom.id, {
        price: editFormData.price,
        image_url: roomAdminData.images[0] || undefined,
        images: roomAdminData.images,
        size_sqm: editFormData.size_sqm ? parseInt(String(editFormData.size_sqm)) : undefined,
        adults: editFormData.adults ? parseInt(String(editFormData.adults)) : 2,
        children: editFormData.children ? parseInt(String(editFormData.children)) : 0,
        status: editFormData.status as 'available' | 'unavailable',
        featured: editFormData.featured,
        translations: roomAdminData.translations,
        amenities: roomAdminData.amenities.map(a => ({ translations: a.translations })),
      });
      toast.success(t('common.roomUpdated'));
      setEditingRoom(null);
      setEditFormData({});
      setRoomAdminData(null);
      // Trigger parent refresh
      onUpdateRoom(String(editingRoom.id), editFormData);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.updateFailed');
      toast.error(errorMessage);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim() || !roomAdminData) return;
    setRoomAdminData({
      ...roomAdminData,
      images: [...roomAdminData.images, newImageUrl.trim()],
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (!roomAdminData || roomAdminData.images.length <= 1) return;
    setRoomAdminData({
      ...roomAdminData,
      images: roomAdminData.images.filter((_, i) => i !== index),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!roomAdminData || draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newImages = [...roomAdminData.images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    setRoomAdminData({
      ...roomAdminData,
      images: newImages,
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const updateTranslation = (lang: string, field: 'name' | 'description', value: string) => {
    if (!roomAdminData) return;
    setRoomAdminData({
      ...roomAdminData,
      translations: roomAdminData.translations.map(t =>
        t.language === lang ? { ...t, [field]: value } : t
      ),
    });
  };

  const updateAmenityTranslation = (amenityIdx: number, lang: string, value: string) => {
    if (!roomAdminData) return;
    setRoomAdminData({
      ...roomAdminData,
      amenities: roomAdminData.amenities.map((a, i) =>
        i === amenityIdx
          ? { ...a, translations: a.translations.map(t => t.language === lang ? { ...t, name: value } : t) }
          : a
      ),
    });
  };

  const addAmenity = () => {
    if (!roomAdminData) return;
    setRoomAdminData({
      ...roomAdminData,
      amenities: [
        ...roomAdminData.amenities,
        { id: Date.now(), translations: LANGUAGES.map(l => ({ language: l.code, name: '' })) },
      ],
    });
  };

  const removeAmenity = (idx: number) => {
    if (!roomAdminData) return;
    setRoomAdminData({
      ...roomAdminData,
      amenities: roomAdminData.amenities.filter((_, i) => i !== idx),
    });
  };

  const getTranslationStatus = (translations: { language: string; name: string; description?: string }[]) => {
    return LANGUAGES.map(lang => {
      const t = translations.find(tr => tr.language === lang.code);
      const filled = t ? (t.name && (t.description === undefined || t.description)) : false;
      return { ...lang, filled };
    });
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
                  {room.status === 'available' ? t('manageRooms.available') : t('manageRooms.maintenance')}
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEditClick(room)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {t('manageRooms.editRoomDetails')}
              </motion.button>
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
                  onClick={() => { setEditingRoom(null); setRoomAdminData(null); }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer hover:opacity-80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {isLoadingAdmin ? (
                  <div className="text-center py-12 text-muted-foreground">{t('manageRooms.loadingTranslations')}</div>
                ) : (
                  <>
                    {/* Multi-Image Management Section */}
                    {roomAdminData && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4" />
                          <h4 className="font-bold text-lg">{t('manageRooms.roomImages')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('manageRooms.roomImagesSubtitle')}</p>

                        {/* Add new image input */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                            placeholder={t('manageRooms.imageUrlPlaceholder')}
                            className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={handleAddImage}
                            disabled={!newImageUrl.trim()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                          >
                            <Plus className="w-4 h-4" /> {t('manageRooms.addImage')}
                          </button>
                        </div>

                        {/* Image list */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {roomAdminData.images.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">{t('manageRooms.noImagesAdded')}</p>
                            </div>
                          ) : (
                            roomAdminData.images.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={(e) => handleDrop(e, idx)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                                  dragOverIndex === idx
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                    : draggedIndex === idx
                                    ? 'opacity-50 border-dashed border-primary'
                                    : 'bg-muted/30 border-border'
                                }`}
                              >
                                {/* Drag handle icon */}
                                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 sm:mt-0" />

                                {/* Thumbnail */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                  <ImageWithFallback
                                    src={imgUrl}
                                    alt={`Room image ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* URL and badge */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {idx === 0 && (
                                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {t('manageRooms.primaryImage')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate" title={imgUrl}>
                                    {imgUrl}
                                  </p>
                                </div>

                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  disabled={roomAdminData.images.length <= 1}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                                  title={roomAdminData.images.length <= 1 ? t('manageRooms.atLeastOneImageRequired') : t('manageRooms.removeImage')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Validation warning */}
                        {roomAdminData.images.length === 0 && (
                          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {t('manageRooms.atLeastOneImageRequired')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="relative">
                          <input
                            type="number"
                            value={editFormData.size_sqm || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, size_sqm: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-4 py-2 pr-16 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                            placeholder="35"
                            min="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{t('staffRooms.sqm')}</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold mb-2">
                          <SettingsIcon className="w-4 h-4" /> {t('staffRooms.adults')}
                        </label>
                        <input
                          type="number"
                          value={editFormData.adults || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, adults: e.target.value ? parseInt(e.target.value) : 2 })}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="2"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold mb-2">
                          <SettingsIcon className="w-4 h-4" /> {t('staffRooms.children')}
                        </label>
                        <input
                          type="number"
                          value={editFormData.children || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, children: e.target.value ? parseInt(e.target.value) : 0 })}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold mb-2">
                          <SettingsIcon className="w-4 h-4" /> {t('manageRooms.roomStatus')}
                        </label>
                        <select
                          value={editFormData.status || 'available'}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'available' | 'unavailable' })}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="available">{t('manageRooms.available')}</option>
                          <option value="unavailable">{t('manageRooms.maintenance')}</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.featured || false}
                            onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-bold">{t('manageRooms.featuredRoom')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Multilingual Translations */}
                    {roomAdminData && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="w-4 h-4" />
                          <h4 className="font-bold text-lg">{t('manageRooms.roomName')}</h4>
                        </div>

                        {/* Language Tabs */}
                        <div className="flex gap-2 mb-4">
                          {getTranslationStatus(roomAdminData.translations).map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => setActiveLangTab(lang.code)}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                activeLangTab === lang.code
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {lang.label}
                              {lang.filled ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <span className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Active Language Inputs */}
                        {roomAdminData.translations.filter(t => t.language === activeLangTab).map(trans => (
                          <div key={trans.language} className="space-y-4">
                            <div>
                              <label className="text-sm font-bold mb-2 block">{t('manageRooms.name')}</label>
                              <input
                                type="text"
                                value={trans.name}
                                onChange={(e) => updateTranslation(trans.language, 'name', e.target.value)}
                                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder={trans.name ? '' : t('manageRooms.notYetTranslated')}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold mb-2 block">{t('manageRooms.description')}</label>
                              <textarea
                                value={trans.description}
                                onChange={(e) => updateTranslation(trans.language, 'description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                                placeholder={trans.description ? '' : t('manageRooms.notYetTranslated')}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Multilingual Amenities */}
                    {roomAdminData && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            <h4 className="font-bold text-lg">{t('manageRooms.amenities')}</h4>
                          </div>
                          <button
                            onClick={addAmenity}
                            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-80 cursor-pointer flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> {t('manageRooms.addAmenity')}
                          </button>
                        </div>

                        <div className="space-y-4">
                          {roomAdminData.amenities.map((amenity, amenityIdx) => {
                            const status = getTranslationStatus(amenity.translations);
                            return (
                              <div key={amenityIdx} className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    {status.map(lang => (
                                      <span key={lang.code} className={`text-xs px-2 py-0.5 rounded ${lang.filled ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                        {lang.label} {lang.filled ? '✓' : '○'}
                                      </span>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => removeAmenity(amenityIdx)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {amenity.translations.map((trans: AmenityTranslationData) => (
                                    <input
                                      key={trans.language}
                                      type="text"
                                      value={trans.name}
                                      onChange={(e) => updateAmenityTranslation(amenityIdx, trans.language, e.target.value)}
                                      className="px-3 py-1.5 bg-background border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                                      placeholder={LANGUAGES.find(l => l.code === trans.language)?.label}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          {roomAdminData.amenities.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('manageRooms.noAmenities')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveRoom}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('manageRooms.saveChanges')}
                </motion.button>
                <button
                  onClick={() => { setEditingRoom(null); setRoomAdminData(null); }}
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