import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Save, Globe, CheckCircle, Tag, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room } from '../components/RoomCard';
import { roomsAPI, getErrorMessage, RoomAdminData, RoomTranslationData, AmenityTranslationData } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'zh-TW', label: '繁體', fullLabel: '繁體中文' },
  { code: 'zh-CN', label: '简体', fullLabel: '简体中文' },
];

interface RoomFormState {
  price: number;
  image_url: string;
  size: string;
  occupancy: string;
  status: 'available' | 'unavailable';
  featured: boolean;
  room_type: 'luxury' | 'suite' | 'business' | 'standard';
  translations: RoomTranslationData[];
  amenities: { translations: AmenityTranslationData[] }[];
}

const emptyTranslations: RoomTranslationData[] = LANGUAGES.map(l => ({
  language: l.code,
  name: '',
  description: '',
}));

const emptyForm: RoomFormState = {
  price: 0,
  image_url: '',
  size: '',
  occupancy: '',
  status: 'available',
  featured: false,
  room_type: 'standard',
  translations: emptyTranslations,
  amenities: [],
};

export const AdminRoomsPage = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormState>(emptyForm);
  const [activeLangTab, setActiveLangTab] = useState('en');
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
    setFormData({ ...emptyForm, translations: emptyTranslations.map(t => ({ ...t })) });
    setActiveLangTab('en');
    setModalOpen(true);
  };

  const openEditModal = async (room: Room) => {
    setEditingRoom(room);
    setActiveLangTab('en');
    try {
      const adminData = await roomsAPI.getByIdAdmin(room.id);
      setFormData({
        price: adminData.price,
        image_url: adminData.image_url || '',
        size: adminData.size || '',
        occupancy: adminData.occupancy || '',
        status: adminData.status,
        featured: adminData.featured,
        room_type: adminData.room_type,
        translations: adminData.translations.length > 0
          ? adminData.translations
          : emptyTranslations.map(t => ({ ...t })),
        amenities: adminData.amenities.map(a => ({
          translations: a.translations.length > 0
            ? a.translations
            : LANGUAGES.map(l => ({ language: l.code, name: '' })),
        })),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.loadingFailed');
      toast.error(errorMessage);
      setFormData({
        price: room.price,
        image_url: room.image_url || '',
        size: room.size || '',
        occupancy: room.occupancy || '',
        status: room.status,
        featured: room.featured,
        room_type: room.room_type,
        translations: emptyTranslations.map(t => ({ ...t })),
        amenities: [],
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const hasAnyName = formData.translations.some(t => t.name.trim());
    if (!hasAnyName || formData.price <= 0) {
      toast.error(t('adminRooms.nameAndPriceRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        price: formData.price,
        image_url: formData.image_url || undefined,
        size: formData.size || undefined,
        occupancy: formData.occupancy || undefined,
        status: formData.status,
        featured: formData.featured,
        room_type: formData.room_type,
        translations: formData.translations,
        amenities: formData.amenities,
      };

      if (editingRoom) {
        await roomsAPI.update(editingRoom.id, payload);
        toast.success(t('common.roomUpdated'));
      } else {
        await roomsAPI.create(payload);
        toast.success(t('common.roomCreated'));
      }
      setModalOpen(false);
      await fetchRooms();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.saveFailed');
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
      toast.success(t('common.roomDeleted'));
      await fetchRooms();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.deleteFailed');
      toast.error(errorMessage);
    }
    setDeleteDialog({ isOpen: false, roomId: 0, roomName: '' });
  };

  const updateTranslation = (lang: string, field: 'name' | 'description', value: string) => {
    setFormData({
      ...formData,
      translations: formData.translations.map(t =>
        t.language === lang ? { ...t, [field]: value } : t
      ),
    });
  };

  const updateAmenityTranslation = (amenityIdx: number, lang: string, value: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.map((a, i) =>
        i === amenityIdx
          ? { ...a, translations: a.translations.map(t => t.language === lang ? { ...t, name: value } : t) }
          : a
      ),
    });
  };

  const addAmenity = () => {
    setFormData({
      ...formData,
      amenities: [
        ...formData.amenities,
        { translations: LANGUAGES.map(l => ({ language: l.code, name: '' })) },
      ],
    });
  };

  const removeAmenity = (idx: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== idx),
    });
  };

  const getTranslationStatus = (translations: { language: string; name: string; description?: string }[]) => {
    return LANGUAGES.map(lang => {
      const t = translations.find(tr => tr.language === lang.code);
      const filled = t ? (t.name && (t.description === undefined || t.description)) : false;
      return { ...lang, filled };
    });
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

      {/* Desktop Table View */}
      <div className="hidden md:block bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminRooms.room')}</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminRooms.type')}</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminRooms.price')}</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminRooms.status')}</th>
              <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminRooms.actions')}</th>
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
                <tr key={room.id} className="text-sm hover:bg-muted/30 transition-colors">
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
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                      {t(`adminRooms.${room.room_type}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">${room.price}{t('adminRooms.perNight')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'available' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {room.status === 'available' ? t('adminRooms.available') : t('adminRooms.maintenance')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(room)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        title={t('adminRooms.editRoom')}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(room)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
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

      {/* Mobile/Tablet Card View */}
      <div className="md:hidden space-y-4">
        {rooms.length === 0 ? (
          <div className="bg-background rounded-xl border border-border p-8 text-center text-muted-foreground">
            {t('adminRooms.noRoomsFound')}
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="bg-background rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
              <div className="flex gap-4">
                {/* Room Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {room.image_url ? (
                    <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No img</span>
                  )}
                </div>
                
                {/* Room Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-base truncate">{room.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      room.status === 'available' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {room.status === 'available' ? t('adminRooms.available') : t('adminRooms.maintenance')}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p>{room.size || 'N/A'} • {room.occupancy || 'N/A'}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">${room.price}{t('adminRooms.perNight')}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                        {t(`adminRooms.${room.room_type}`)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <button 
                      onClick={() => openEditModal(room)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      {t('adminRooms.editRoom')}
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(room)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('adminRooms.deleteRoom')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border"
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

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Image */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3">
                    <ImageIcon className="w-4 h-4" /> {t('adminRooms.imageUrl')}
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('adminRooms.imageUrlPlaceholder')}
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-2 pr-16 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="35"
                        min="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">sqm</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.occupancy')}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.occupancy}
                        onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                        className="w-full px-4 py-2 pr-20 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="2"
                        min="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">guests</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.roomStatus')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'unavailable' })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="available">{t('adminRooms.available')}</option>
                      <option value="unavailable">{t('adminRooms.maintenance')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold mb-2 block">{t('adminRooms.roomType')}</label>
                    <select
                      value={formData.room_type}
                      onChange={(e) => setFormData({ ...formData, room_type: e.target.value as 'luxury' | 'suite' | 'business' | 'standard' })}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="standard">{t('adminRooms.standard')}</option>
                      <option value="business">{t('adminRooms.business')}</option>
                      <option value="luxury">{t('adminRooms.luxury')}</option>
                      <option value="suite">{t('adminRooms.suite')}</option>
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

                {/* Multilingual Name & Description */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4" />
                    <h4 className="font-bold text-lg">{t('manageRooms.roomName')}</h4>
                  </div>

                  {/* Language Tabs */}
                  <div className="flex gap-2 mb-4">
                    {getTranslationStatus(formData.translations).map(lang => (
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
                        {activeLangTab === lang.code ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : lang.filled ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Active Language Inputs */}
                  {formData.translations.filter(t => t.language === activeLangTab).map(trans => (
                    <div key={trans.language} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold mb-2 block">{t('adminRooms.nameLabel')}</label>
                        <input
                          type="text"
                          value={trans.name}
                          onChange={(e) => updateTranslation(trans.language, 'name', e.target.value)}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder={t('adminRooms.namePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">{t('adminRooms.descriptionLabel')}</label>
                        <textarea
                          value={trans.description}
                          onChange={(e) => updateTranslation(trans.language, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                          placeholder={t('adminRooms.descriptionPlaceholder')}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Multilingual Amenities */}
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
                      <Plus className="w-4 h-4" /> {t('adminRooms.addAmenity')}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.amenities.map((amenity, amenityIdx) => {
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
                    {formData.amenities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">{t('adminRooms.noAmenities')}</p>
                    )}
                  </div>
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