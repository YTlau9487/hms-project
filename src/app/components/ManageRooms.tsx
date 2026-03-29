import React, { useState, useEffect } from 'react';
import {
  Edit2,
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
  Globe,
  Trash2,
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
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to load room translations';
      toast.error(errorMessage);
      setRoomAdminData(null);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleSaveRoom = async () => {
    if (!editingRoom || !roomAdminData) return;

    try {
      await roomsAPI.update(editingRoom.id, {
        price: editFormData.price,
        image_url: editFormData.image_url || undefined,
        size: editFormData.size || undefined,
        occupancy: editFormData.occupancy || undefined,
        status: editFormData.status as 'available' | 'unavailable',
        featured: editFormData.featured,
        translations: roomAdminData.translations,
        amenities: roomAdminData.amenities.map(a => ({ translations: a.translations })),
      });
      toast.success('Room updated successfully!');
      setEditingRoom(null);
      setEditFormData({});
      setRoomAdminData(null);
      // Trigger parent refresh
      onUpdateRoom(String(editingRoom.id), editFormData);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'Failed to update room';
      toast.error(errorMessage);
    }
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
                  <div className="text-center py-12 text-muted-foreground">Loading translations...</div>
                ) : (
                  <>
                    {/* Image Section */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold mb-3">
                        <ImageIcon className="w-4 h-4" /> {t('manageRooms.roomPhoto')}
                      </label>
                      <div className="relative h-64 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 group cursor-pointer" onClick={() => {
                        const mockImages = [
                          'https://images.unsplash.com/photo-1590490359854-dfba19688d70?w=1080',
                          'https://images.unsplash.com/photo-1759221793465-4795ba2eaafc?w=1080',
                        ];
                        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
                        setEditFormData({ ...editFormData, image_url: randomImage });
                        toast.success('Image uploaded successfully!');
                      }}>
                        <ImageWithFallback
                          src={editFormData.image_url || editingRoom.image_url || ''}
                          alt="Room preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center text-white">
                            <Upload className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-bold">{t('manageRooms.clickToUpload')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

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
                            value={editFormData.size || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                            className="w-full px-4 py-2 pr-16 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                            placeholder="35"
                            min="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">sqm</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold mb-2">
                          <SettingsIcon className="w-4 h-4" /> {t('manageRooms.occupancy')}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={editFormData.occupancy || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, occupancy: e.target.value })}
                            className="w-full px-4 py-2 pr-20 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                            placeholder="2"
                            min="1"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">guests</span>
                        </div>
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
                          <h4 className="font-bold text-lg">Room Name & Description</h4>
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
                              <label className="text-sm font-bold mb-2 block">Name</label>
                              <input
                                type="text"
                                value={trans.name}
                                onChange={(e) => updateTranslation(trans.language, 'name', e.target.value)}
                                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder={trans.name ? '' : 'Not yet translated'}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold mb-2 block">Description</label>
                              <textarea
                                value={trans.description}
                                onChange={(e) => updateTranslation(trans.language, 'description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                                placeholder={trans.description ? '' : 'Not yet translated'}
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
                            <h4 className="font-bold text-lg">Amenities</h4>
                          </div>
                          <button
                            onClick={addAmenity}
                            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-80 cursor-pointer flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add Amenity
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