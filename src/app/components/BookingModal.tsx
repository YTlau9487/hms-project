import React, { useState } from 'react';
import { X, ChevronRight, Check, Coffee, Wifi, Car, Waves, Tv, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room } from './RoomCard';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: any) => void;
  user: any;
}

export const BookingModal = ({ room, isOpen, onClose, onConfirm, user }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  });

  if (!isOpen || !room) return null;

  // Use room-specific packages or fallback to default
  const packages = room.packages && room.packages.length > 0 
    ? room.packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: Math.round(room.price * pkg.priceMultiplier),
        desc: pkg.description
      }))
    : [
        { id: 'default-1', name: 'Standard Stay', price: 0, desc: 'Includes complimentary WiFi and pool access.' },
        { id: 'default-2', name: 'Breakfast Delight', price: 45, desc: 'Daily gourmet breakfast buffet for all guests.' },
        { id: 'default-3', name: 'VIP Experience', price: 120, desc: 'Breakfast, airport transfer, and late check-out.' },
      ];

  // Set default package if not selected
  if (!selectedPackageId && packages.length > 0) {
    setSelectedPackageId(packages[0].id);
  }

  const selectedPackage = packages.find(p => p.id === selectedPackageId) || packages[0];

  const handleConfirm = () => {
    onConfirm({
      room,
      package: selectedPackage,
      customer: formData,
      total: room.price + (selectedPackage?.price || 0)
    });
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
            <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-xl font-bold">{room.name}</h2>
              <p className="text-sm opacity-80">{room.type}</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">Room Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Wifi className="w-3.5 h-3.5 text-primary" /> Free WiFi
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Waves className="w-3.5 h-3.5 text-primary" /> Pool Access
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Tv className="w-3.5 h-3.5 text-primary" /> Smart TV
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Safe Box
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-2">Description</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {room.description}
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">Base Price</span>
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
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
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
                    <h2 className="text-2xl font-bold mb-2">Enhance Your Stay</h2>
                    <p className="text-muted-foreground">Choose a package to make your visit even more memorable.</p>
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
                            {pkg.price === 0 ? 'FREE' : `+$${pkg.price}`}
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
                    <h2 className="text-2xl font-bold mb-2">Guest Details</h2>
                    <p className="text-muted-foreground">Please provide your contact information to finalize the booking.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">First Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Special Requests</label>
                      <textarea 
                        className="w-full bg-input-background border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary min-h-[80px]"
                        placeholder="e.g. Early check-in, high floor..."
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
                    <h2 className="text-2xl font-bold mb-2">Ready to Confirm?</h2>
                    <p className="text-muted-foreground">You are booking the <span className="font-bold text-foreground">{room.name}</span> with the <span className="font-bold text-foreground">{selectedPackage?.name}</span>.</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Room Base Price</span>
                      <span className="font-bold">${room.price}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border pb-3">
                      <span>Package Upgrade</span>
                      <span className="font-bold">+${selectedPackage?.price || 0}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary">${room.price + (selectedPackage?.price || 0)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    By confirming, you agree to our terms of service and cancellation policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-border flex justify-between bg-background">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border font-bold hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : handleConfirm()}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90"
            >
              {step === 3 ? 'Confirm Booking' : 'Next Step'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
