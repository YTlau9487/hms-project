import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Wifi, Coffee, Tv, Shield, Waves, Wind, Car, Utensils, Star, Maximize2, Users } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room } from './RoomCard';

interface RoomDetailsProps {
  room: Room;
  onBack: () => void;
  onBookNow: (room: Room) => void;
}

export const RoomDetails = ({ room, onBack, onBookNow }: RoomDetailsProps) => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  
  const allAmenities = [
    { icon: Wifi, label: 'High-speed WiFi' },
    { icon: Coffee, label: 'Complimentary Breakfast' },
    { icon: Tv, label: '4K Smart TV' },
    { icon: Shield, label: 'Digital Safe' },
    { icon: Waves, label: 'Pool Access' },
    { icon: Wind, label: 'Climate Control' },
    { icon: Car, label: 'Valet Parking' },
    { icon: Utensils, label: '24/7 Room Service' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-background min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div 
              className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setSelectedImage(room.image)}
            >
              <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="rounded-xl overflow-hidden aspect-square shadow-md hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setSelectedImage(room.image)}
                >
                  <ImageWithFallback 
                    src={room.image} 
                    alt={`View ${i}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {room.type}
                </span>
                <div className="flex items-center gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{room.name}</h1>
              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5" />
                  <span>{room.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{room.occupancy}</span>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">What this room offers</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {allAmenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <amenity.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {room.packages && room.packages.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Available Packages</h3>
                <div className="space-y-3">
                  {room.packages.map((pkg) => (
                    <div key={pkg.id} className="p-4 bg-accent/10 rounded-xl border border-accent/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-accent-foreground">{pkg.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-accent-foreground">
                            +{(pkg.priceMultiplier * 100).toFixed(0)}%
                          </span>
                          <p className="text-xs text-muted-foreground">
                            ${Math.round(room.price * pkg.priceMultiplier)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Select your preferred package during the booking process
                </p>
              </div>
            )}

            <div className="p-8 bg-muted/50 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-4xl font-bold text-primary">${room.price}</span>
                <span className="text-muted-foreground"> / night</span>
                <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes and service charges</p>
              </div>
              <button 
                onClick={() => onBookNow(room)}
                className="w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:scale-105 transition-transform shadow-xl cursor-pointer"
              >
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-video"
            >
              <ImageWithFallback src={selectedImage} alt="Enlarged view" className="w-full h-full object-contain" />
              <button 
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <ArrowLeft className="w-6 h-6 rotate-90" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
