import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { EnhancedHero } from '../components/EnhancedHero';
import { RoomCard, Room } from '../components/RoomCard';
import { toast } from 'sonner';
import { roomsAPI, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface HomePageProps {
  onBookNow: (room: Room) => void;
}

export const HomePage = ({ onBookNow }: HomePageProps) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeFilter, setActiveFilter] = useState('All Rooms');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsAPI.list({ status: 'available' });
      setRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : '無法取得房型資料';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredRoom = rooms.find(room => room.featured && room.status === 'available') || null;

  const filteredRooms = rooms.filter(room => 
    activeFilter === 'All Rooms' || room.status === 'available'
  );

  const handleViewDetails = (room: Room) => {
    navigate(`/rooms/${room.id}`);
  };

  const handleViewFeatured = () => {
    if (featuredRoom) {
      navigate(`/rooms/${featuredRoom.id}`);
    }
  };

  const handleSearch = (params: any) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Searching available rooms...',
        success: () => {
          const element = document.getElementById('rooms-section');
          element?.scrollIntoView({ behavior: 'smooth' });
          return 'Found matching luxury rooms for your dates!';
        },
        error: 'Error searching for rooms',
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="載入房型資料中..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRooms} />;
  }

  return (
    <>
      <EnhancedHero 
        onBookNow={() => {
          const element = document.getElementById('rooms-section');
          element?.scrollIntoView({ behavior: 'smooth' });
        }} 
        onSearch={handleSearch}
        featuredRoom={featuredRoom}
        onViewFeatured={handleViewFeatured}
      />
      
      <section id="rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-4">Our Curated Rooms</h2>
            <p className="text-muted-foreground max-w-xl">
              Each room is meticulously designed to provide a haven of tranquility amidst the vibrant pulse of Hong Kong.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All Rooms', 'Luxury', 'Suite', 'Business'].map((filter) => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full border text-sm font-bold transition-all cursor-pointer ${
                  activeFilter === filter 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onViewDetails={handleViewDetails}
                onBookNow={onBookNow}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No rooms found matching this category.
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">World-Class Facilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond your room, explore a world of dining, relaxation, and wellness.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer">
              <img src="https://images.unsplash.com/photo-1769638913569-40fc740b44f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGJyZWFrZmFzdCUyMGJ1ZmZldCUyMHNlbGVjdGlvbiUyMGZyZXNoJTIwZm9vZHxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Dining" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-xl font-bold mb-2">Exquisite Dining</h3>
                <p className="text-sm opacity-80">Award-winning Cantonese and international cuisine.</p>
              </div>
            </div>
            <div className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer">
              <img src="https://images.unsplash.com/photo-1761049862641-16616dea7b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHNwYSUyMHdlbGxuZXNzJTIwY2VudGVyJTIwcG9vbHxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Spa" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-xl font-bold mb-2">Wellness & Spa</h3>
                <p className="text-sm opacity-80">Rejuvenate your senses with our holistic treatments.</p>
              </div>
            </div>
            <div className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer">
              <img src="https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Lobby" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-xl font-bold mb-2">Luxury Lounge</h3>
                <p className="text-sm opacity-80">Relax in our elegantly designed guest spaces.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};