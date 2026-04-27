import React from 'react';
import { Star, Wifi, Coffee, Maximize2, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import { Room as APIRoom } from '../services/api';
import { useTranslation } from 'react-i18next';

// Re-export API Room type for compatibility
export type Room = APIRoom;

export interface RoomPackage {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number; // Percentage to add to base price (e.g., 0.15 = 15%)
}

interface RoomCardProps {
  room: Room;
  onViewDetails: (room: Room) => void;
  onBookNow: (room: Room) => void;
}

export const RoomCard = ({ room, onViewDetails, onBookNow }: RoomCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: '16/10' }} onClick={() => onViewDetails(room)}>
        <ImageWithFallback
          src={room.image_url || ''}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
          {room.featured && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            {t('roomCard.featured')}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => onViewDetails(room)}>{room.name}</h3>
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">4.9</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {room.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {room.size_sqm && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Maximize2 className="w-4 h-4" />
              <span className="text-xs">
                {t('roomCard.sizeLabel', { value: room.size_sqm })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-xs">
              {t('roomCard.adults', { count: room.adults })}
              {room.children > 0 && `, ${t('roomCard.children', { count: room.children })}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="w-4 h-4" />
            <span className="text-xs">{t('roomCard.freeWifi')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coffee className="w-4 h-4" />
            <span className="text-xs">{t('roomCard.breakfastIncluded')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">${room.price}</span>
            <span className="text-xs text-muted-foreground"> {t('roomCard.perNight')}</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onViewDetails(room)}
              className="text-sm font-bold hover:text-primary transition-colors cursor-pointer hover:opacity-80"
            >
            {t('roomCard.details')}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBookNow(room)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
            >
              {t('roomCard.book')} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};