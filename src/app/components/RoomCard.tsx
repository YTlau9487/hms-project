import React from 'react';
import { Star, Wifi, Coffee, Maximize2, Users, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

export interface RoomPackage {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number; // Percentage to add to base price (e.g., 0.15 = 15%)
}

export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  size: string;
  occupancy: string;
  amenities: string[];
  description: string;
  packages?: RoomPackage[];
  status?: 'available' | 'maintenance';
  featured?: boolean; // For hero section promotion
}

interface RoomCardProps {
  room: Room;
  onViewDetails: (room: Room) => void;
  onBookNow: (room: Room) => void;
}

export const RoomCard = ({ room, onViewDetails, onBookNow }: RoomCardProps) => {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => onViewDetails(room)}>
        <ImageWithFallback
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {room.type}
        </div>
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

        {room.packages && room.packages.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-accent-foreground bg-accent/20 px-2 py-1 rounded-full border border-accent/30">
              {room.packages.length} Package{room.packages.length > 1 ? 's' : ''} Available
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Maximize2 className="w-4 h-4" />
            <span className="text-xs">{room.size}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-xs">{room.occupancy}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="w-4 h-4" />
            <span className="text-xs">Free Wifi</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coffee className="w-4 h-4" />
            <span className="text-xs">Breakfast Included</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">${room.price}</span>
            <span className="text-xs text-muted-foreground"> / night</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onViewDetails(room)}
              className="text-sm font-bold hover:text-primary transition-colors cursor-pointer"
            >
              Details
            </button>
            <button 
              onClick={() => onBookNow(room)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
            >
              Book <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
