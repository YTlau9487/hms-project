import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Wifi, Coffee, Tv, Shield, Waves, Wind, Car, Utensils, Star, Maximize2, Users } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room } from './RoomCard';
import { useTranslation } from 'react-i18next';

interface RoomDetailsProps {
  room: Room;
  onBack: () => void;
  onBookNow: (room: Room) => void;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi, 'Free WiFi': Wifi, 'High-Speed WiFi': Wifi, '免費WiFi': Wifi, '免费WiFi': Wifi, '高速WiFi': Wifi,
  'Coffee': Coffee, 'Nespresso': Coffee, 'Nespresso咖啡機': Coffee, 'Nespresso咖啡机': Coffee,
  'TV': Tv, 'Smart TV': Tv, '智能電視': Tv, '智能电视': Tv,
  'Safe': Shield, 'Digital Safe': Shield,
  'Pool': Waves, 'Pool Access': Waves,
  'AC': Wind, 'Climate Control': Wind,
  'Parking': Car, 'Valet Parking': Car,
  'Dining': Utensils, 'Room Service': Utensils,
};

export const RoomDetails = ({ room, onBack, onBookNow }: RoomDetailsProps) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const displayAmenities = room.amenities && room.amenities.length > 0
    ? room.amenities
    : [];

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
          {t('roomDetails.backToRooms')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div
              className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setSelectedImage(room.image_url)}
            >
              <ImageWithFallback src={room.image_url || ''} alt={room.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden aspect-square shadow-md hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setSelectedImage(room.image_url || null)}
                >
                  <ImageWithFallback
                    src={room.image_url || ''}
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
                  {room.featured ? t('roomDetails.featured') : t('roomDetails.standard')}
                </span>
                <div className="flex items-center gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{room.name}</h1>
              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                {room.size && (
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-5 h-5" />
                    <span>{room.size}</span>
                  </div>
                )}
                {room.occupancy && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{room.occupancy}</span>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">{t('roomDetails.whatThisRoomOffers')}</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {displayAmenities.map((amenity, i) => {
                  const IconComponent = amenityIcons[amenity] || Check;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-muted/50 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-4xl font-bold text-primary">${room.price}</span>
                <span className="text-muted-foreground"> {t('roomDetails.perNight')}</span>
                <p className="text-xs text-muted-foreground mt-1">{t('roomDetails.inclusiveTaxes')}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBookNow(room)}
                className="w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 transition-opacity shadow-xl cursor-pointer"
              >
                {t('roomDetails.reserveNow')}
              </motion.button>
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
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer hover:opacity-80"
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