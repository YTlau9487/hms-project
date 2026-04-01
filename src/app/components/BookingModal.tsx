import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Coffee, Wifi, Car, Waves, Tv, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room } from './RoomCard';
import { useTranslation } from 'react-i18next';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi, 'Free WiFi': Wifi, 'High-Speed WiFi': Wifi, '免費WiFi': Wifi, '免费WiFi': Wifi, '高速WiFi': Wifi,
  'Coffee': Coffee, 'Nespresso': Coffee, 'Nespresso咖啡機': Coffee, 'Nespresso咖啡机': Coffee,
  'TV': Tv, 'Smart TV': Tv, '智能電視': Tv, '智能电视': Tv,
  'Safe': Shield, 'Digital Safe': Shield,
  'Pool': Waves, 'Pool Access': Waves,
  'Parking': Car, 'Valet Parking': Car,
};

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: any) => void;
  user: any;
}

export const BookingModal = ({ room, isOpen, onClose, onConfirm, user }: BookingModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPackageId('');
      setCheckIn('');
      setCheckOut('');
      setFormData({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: '',
        specialRequests: ''
      });
    }
  }, [isOpen, user]);

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const nights = calculateNights();

  if (!isOpen || !room) return null;

  // Use room-specific packages or fallback to default
  const packages = [
        { id: 'default-1', name: t('bookingModal.packages.standardStay.name'), price: 0, desc: t('bookingModal.packages.standardStay.desc') },
        { id: 'default-2', name: t('bookingModal.packages.breakfastDelight.name'), price: 45, desc: t('bookingModal.packages.breakfastDelight.desc') },
        { id: 'default-3', name: t('bookingModal.packages.vipExperience.name'), price: 120, desc: t('bookingModal.packages.vipExperience.desc') },
      ];

  // Set default package if not selected
  if (!selectedPackageId && packages.length > 0) {
    setSelectedPackageId(packages[0].id);
  }

  const selectedPackage = packages.find(p => p.id === selectedPackageId) || packages[0];

  const handleConfirm = () => {
    if (!checkIn || !checkOut) {
      return;
    }
    const totalPrice = (room.price * nights) + (selectedPackage?.price || 0);
    onConfirm({
      room,
      room_id: room.id,
      checkIn,
      checkOut,
      package: selectedPackage,
      package_name: selectedPackage?.name,
      customer: formData,
      total: totalPrice,
      nights: nights
    });
  };

  const canProceedToNextStep = () => {
    if (step === 2) {
      return checkIn && checkOut && formData.firstName && formData.lastName && formData.email;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-background w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border"
      >
        {/* Left Side: Room Info */}
        <div className="w-full md:w-1/3 bg-muted/30 border-r border-border overflow-y-auto">
            <div className="h-48 md:h-64 relative">
            <ImageWithFallback src={room.image_url || ''} alt={room.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-xl font-bold">{room.name}</h2>
              <p className="text-sm opacity-80">{room.featured ? t('roomDetails.featured') : t('roomDetails.standard')}</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">{t('roomDetails.roomFeatures')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {(room.amenities || []).slice(0, 4).map((amenity, i) => {
                  const IconComponent = amenityIcons[amenity] || Check;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <IconComponent className="w-3.5 h-3.5 text-primary" /> {amenity}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-2">{t('roomDetails.description')}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {room.description}
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">{t('bookingModal.step3.roomBasePrice')}</span>
                <span className="text-2xl font-bold">${room.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Flow */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`w-8 h-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full cursor-pointer hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t('bookingModal.step1.title')}</h2>
                    <p className="text-muted-foreground">{t('bookingModal.step1.subtitle')}</p>
                  </div>
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                          selectedPackageId === pkg.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPackageId === pkg.id ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30'
                        }`}>
                          {selectedPackageId === pkg.id && <Check className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{pkg.name}</h4>
                          <p className="text-xs text-muted-foreground">{pkg.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">
                            {pkg.price === 0 ? t('bookingModal.free') : `+$${pkg.price}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t('bookingModal.step2.title')}</h2>
                    <p className="text-muted-foreground">{t('bookingModal.step2.subtitle')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('hero.checkIn')}</label>
                      <input 
                        type="date" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('hero.checkOut')}</label>
                      <input 
                        type="date" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('bookingModal.firstName')}</label>
                      <input 
                        type="text" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('bookingModal.lastName')}</label>
                      <input 
                        type="text" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('bookingModal.emailAddress')}</label>
                      <input 
                        type="email" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('bookingModal.phoneNumber')}</label>
                      <input 
                        type="tel" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t('bookingModal.specialRequests')}</label>
                      <textarea 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary min-h-[80px]"
                        placeholder={t('bookingModal.specialRequestsPlaceholder')}
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t('bookingModal.step3.title')}</h2>
                    <p className="text-muted-foreground">{t('bookingModal.step3.subtitle')} <span className="font-bold text-foreground">{room.name}</span> {t('bookingModal.step3.withPackage')} <span className="font-bold text-foreground">{selectedPackage?.name}</span>.</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{t('hero.checkIn')}</span>
                      <span className="font-bold">{checkIn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('hero.checkOut')}</span>
                      <span className="font-bold">{checkOut}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <span>{t('bookingModal.step3.roomBasePrice')}</span>
                      <span className="font-bold">${room.price} × {nights} {nights === 1 ? t('bookingModal.night') : t('bookingModal.nights')}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border pb-3">
                      <span>{t('bookingModal.step3.packageUpgrade')}</span>
                      <span className="font-bold">+${selectedPackage?.price || 0}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('bookingModal.step3.totalAmount')}</span>
                      <span className="text-primary">${(room.price * nights) + (selectedPackage?.price || 0)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {t('bookingModal.step3.termsNotice')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-border flex justify-between bg-background">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border font-bold hover:bg-muted cursor-pointer hover:opacity-80"
              >
                <ArrowLeft className="w-4 h-4" /> {t('bookingModal.back')}
              </button>
            ) : (
              <div />
            )}
            
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : handleConfirm()}
              disabled={!canProceedToNextStep()}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? t('bookingModal.confirmBooking') : t('bookingModal.nextStep')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
