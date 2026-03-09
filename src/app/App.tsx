import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EnhancedHero } from './components/EnhancedHero';
import { RoomCard, Room, RoomPackage } from './components/RoomCard';
import { RoomDetails } from './components/RoomDetails';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { MyBookings } from './components/MyBookings';
import { UserProfile } from './components/UserProfile';

const INITIAL_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Premier King Room',
    type: 'Luxury',
    price: 280,
    image: 'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBraW5nJTIwYmVkJTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MXx8fHwxNzcwODUzMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    size: '38 sq.m',
    occupancy: '2 Adults',
    amenities: ['King Bed', 'City View', 'Free WiFi', 'Smart TV'],
    description: 'Our Premier King Room offers a sophisticated sanctuary with stunning city views and bespoke furnishings for the ultimate urban retreat.',
    status: 'available',
    packages: [
      { id: 'pkg-1', name: 'Room Only', description: 'Includes complimentary WiFi and pool access.', priceMultiplier: 0 },
      { id: 'pkg-2', name: 'Breakfast Included', description: 'Daily gourmet breakfast buffet for all guests.', priceMultiplier: 0.15 },
      { id: 'pkg-3', name: 'VIP Experience', description: 'Breakfast, airport transfer, and late check-out.', priceMultiplier: 0.35 }
    ]
  },
  {
    id: '2',
    name: 'Deluxe Twin Room',
    type: 'Luxury',
    price: 240,
    image: 'https://images.unsplash.com/photo-1759221793465-4795ba2eaafc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFuZGFyZCUyMGhvdGVsJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    size: '35 sq.m',
    occupancy: '2 Adults',
    amenities: ['Twin Beds', 'Garden View', 'Minibar', 'Rain Shower'],
    description: 'Perfect for travelers sharing a space, the Deluxe Twin combines functional design with plush comfort and modern amenities.',
    status: 'available',
    packages: [
      { id: 'pkg-4', name: 'Room Only', description: 'Includes complimentary WiFi and pool access.', priceMultiplier: 0 },
      { id: 'pkg-5', name: 'Breakfast Delight', description: 'Daily buffet breakfast with premium selections.', priceMultiplier: 0.12 }
    ]
  },
  {
    id: '3',
    name: 'Presidential Suite',
    type: 'Suite',
    price: 850,
    image: 'https://images.unsplash.com/photo-1767091116911-afd6612c53c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWx1eGUlMjBob3RlbCUyMHN1aXRlJTIwbGl2aW5nJTIwYXJlYSUyMG1vZGVybiUyMGRlc2lnbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    size: '120 sq.m',
    occupancy: '4 Adults',
    amenities: ['Master Suite', 'Living Area', 'Personal Butler', 'Kitchenette'],
    description: 'Experience the pinnacle of hospitality. Our Presidential Suite features a sprawling layout, private dining area, and panoramic harbor views.',
    status: 'available',
    featured: true,
    packages: [
      { id: 'pkg-6', name: 'Luxury Stay', description: 'Full breakfast, minibar, and butler service.', priceMultiplier: 0.20 },
      { id: 'pkg-7', name: 'Ultimate VIP', description: 'All-inclusive: meals, spa, transfers, and concierge.', priceMultiplier: 0.45 }
    ]
  },
  {
    id: '4',
    name: 'Harbor View Executive',
    type: 'Business',
    price: 420,
    image: 'https://images.unsplash.com/photo-1761049862641-16616dea7b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHNwYSUyMHdlbGxuZXNzJTIwY2VudGVyJTIwcG9vbHxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    size: '45 sq.m',
    occupancy: '2 Adults',
    amenities: ['Lounge Access', 'Harbor View', 'Nespresso', 'Work Desk'],
    description: 'Designed for the discerning business traveler, featuring executive lounge access and the best harbor views in Nathan Road.',
    status: 'available',
    packages: [
      { id: 'pkg-8', name: 'Business Essentials', description: 'Lounge access, WiFi, and work desk setup.', priceMultiplier: 0 },
      { id: 'pkg-9', name: 'Executive Plus', description: 'Breakfast, meeting room access, and priority check-in.', priceMultiplier: 0.18 }
    ]
  }
];

export default function App() {
  const [view, setView] = useState<'customer' | 'staff'>('customer');
  const [customerView, setCustomerView] = useState<'home' | 'my-bookings' | 'profile'>('home');
  const [activeFilter, setActiveFilter] = useState('All Rooms');
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  const filteredRooms = rooms.filter(room => 
    (activeFilter === 'All Rooms' || room.type === activeFilter) && 
    room.status === 'available'
  );

  const featuredRoom = rooms.find(room => room.featured && room.status === 'available') || null;

  const handleBookingConfirm = (details: any) => {
    const newBooking = {
      id: `BK-${Math.floor(Math.random() * 9000) + 1000}`,
      roomName: details.room.name,
      roomImage: details.room.image,
      checkIn: '2026-02-12', 
      checkOut: '2026-02-14',
      total: details.total,
      status: 'confirmed',
      package: details.package.name
    };
    
    setUserBookings([newBooking, ...userBookings]);
    toast.success('Booking Successful!', {
      description: `Your reservation for ${details.room.name} has been confirmed. A confirmation email has been sent to ${details.customer.email}.`,
    });
    setIsBookingOpen(false);
    setSelectedRoomForBooking(null);
    setCustomerView('my-bookings');
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

  const handleBookNow = (room: Room) => {
    if (!user) {
      toast.info('Please log in to book a room');
      setIsAuthOpen(true);
    } else {
      setSelectedRoomForBooking(room);
      setIsBookingOpen(true);
    }
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoomForDetails(room);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const handleUpdateProfile = (userData: any) => {
    setUser({ ...user, ...userData });
  };

  const handleUpdateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    ));
  };

  const handleAddPackage = (roomId: string, packageData: RoomPackage) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, packages: [...(room.packages || []), packageData] }
        : room
    ));
  };

  const handleRemovePackage = (roomId: string, packageId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, packages: room.packages?.filter(pkg => pkg.id !== packageId) }
        : room
    ));
  };

  const handleViewFeatured = () => {
    if (featuredRoom) {
      setSelectedRoomForDetails(featuredRoom);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Toaster position="top-right" expand={false} richColors />
      
      <Navbar 
        user={user} 
        onAuthClick={() => setIsAuthOpen(true)} 
        onLogout={() => {
          setUser(null);
          setView('customer');
          setCustomerView('home');
          toast.info('Logged out successfully');
        }}
        onProfileClick={() => {
          setView('customer');
          setCustomerView('profile');
        }}
        view={view}
        setView={(v) => {
          setView(v);
          setSelectedRoomForDetails(null);
        }}
        customerView={customerView}
        setCustomerView={setCustomerView}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'customer' ? (
            <motion.div
              key={selectedRoomForDetails ? 'details' : customerView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selectedRoomForDetails ? (
                <RoomDetails 
                  room={selectedRoomForDetails} 
                  onBack={() => setSelectedRoomForDetails(null)} 
                  onBookNow={handleBookNow}
                />
              ) : customerView === 'my-bookings' ? (
                <MyBookings 
                  bookings={userBookings} 
                  onBack={() => setCustomerView('home')}
                  onCancelBooking={handleCancelBooking}
                />
              ) : customerView === 'profile' ? (
                <UserProfile 
                  user={user}
                  onBack={() => setCustomerView('home')}
                  onUpdate={handleUpdateProfile}
                />
              ) : (
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
                            onBookNow={handleBookNow}
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
              )}
            </motion.div>
          ) : (
            <motion.div
              key="staff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel 
                rooms={rooms}
                onUpdateRoom={handleUpdateRoom}
                onAddPackage={handleAddPackage}
                onRemovePackage={handleRemovePackage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(userData) => {
          setUser(userData);
          toast.success(`Welcome back, ${userData.name}!`);
          if (userData.role === 'staff') {
            setView('staff');
          }
        }} 
      />

      <BookingModal 
        room={selectedRoomForBooking} 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedRoomForBooking(null);
        }} 
        onConfirm={handleBookingConfirm}
        user={user}
      />
    </div>
  );
}
