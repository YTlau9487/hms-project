import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  DoorOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ManageRooms } from './ManageRooms';
import { Room, RoomPackage } from './RoomCard';
import { toast } from 'sonner';

interface Booking {
  id: string;
  customerName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  total: number;
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 'BK-1001', customerName: 'Alice Johnson', roomType: 'Deluxe Suite', checkIn: '2026-02-12', checkOut: '2026-02-15', status: 'confirmed', total: 1200 },
  { id: 'BK-1002', customerName: 'Bob Smith', roomType: 'Premier King', checkIn: '2026-02-14', checkOut: '2026-02-18', status: 'pending', total: 850 },
  { id: 'BK-1003', customerName: 'Charlie Brown', roomType: 'Standard Twin', checkIn: '2026-02-11', checkOut: '2026-02-13', status: 'cancelled', total: 400 },
  { id: 'BK-1004', customerName: 'Diana Ross', roomType: 'Presidential Suite', checkIn: '2026-02-20', checkOut: '2026-02-25', status: 'confirmed', total: 5000 },
  { id: 'BK-1005', customerName: 'Edward Norton', roomType: 'Deluxe Suite', checkIn: '2026-02-12', checkOut: '2026-02-14', status: 'confirmed', total: 800 },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'N-001',
    type: 'check-in',
    message: 'Alice Johnson has checked in',
    customerName: 'Alice Johnson',
    bookingId: 'BK-1001',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'N-002',
    type: 'cancellation',
    message: 'Charlie Brown requested to cancel booking',
    customerName: 'Charlie Brown',
    bookingId: 'BK-1003',
    timestamp: '3 hours ago',
    read: false,
  },
  {
    id: 'N-003',
    type: 'check-out',
    message: 'Edward Norton has completed check-out',
    customerName: 'Edward Norton',
    bookingId: 'BK-1005',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: 'N-004',
    type: 'check-in',
    message: 'Bob Smith booking date has arrived',
    customerName: 'Bob Smith',
    bookingId: 'BK-1002',
    timestamp: '1 day ago',
    read: true,
  },
];

interface AdminPanelProps {
  rooms?: Room[];
  onUpdateRoom?: (roomId: string, updates: Partial<Room>) => void;
  onAddPackage?: (roomId: string, packageData: RoomPackage) => void;
  onRemovePackage?: (roomId: string, packageId: string) => void;
}

export const AdminPanel = ({ rooms = [], onUpdateRoom, onAddPackage, onRemovePackage }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: string;
    action: 'confirm' | 'cancel';
  }>({ isOpen: false, bookingId: '', action: 'cancel' });

  const stats = [
    { label: 'Total Revenue', value: '$24,500', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Active Bookings', value: '128', icon: CalendarCheck, color: 'text-blue-600' },
    { label: 'Pending Requests', value: '12', icon: Clock, color: 'text-orange-600' },
    { label: 'New Customers', value: '34', icon: Users, color: 'text-purple-600' },
  ];

  const handleStatusChange = (id: string, status: 'confirmed' | 'cancelled') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      const newNotification: Notification = {
        id: `N-${Date.now()}`,
        type: status === 'cancelled' ? 'cancellation' : 'check-in',
        message: `${booking.customerName}'s booking has been ${status}`,
        customerName: booking.customerName,
        bookingId: id,
        timestamp: 'Just now',
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      toast.success(`Booking ${id} ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
    }
    
    setConfirmDialog({ isOpen: false, bookingId: '', action: 'cancel' });
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast.info('All notifications cleared');
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.id.toLowerCase().includes(query) ||
      booking.customerName.toLowerCase().includes(query) ||
      booking.roomType.toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-muted/30">
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Staff Management Dashboard</h1>
              <p className="text-muted-foreground">Monitor and control system operations</p>
            </div>
            <div className="flex gap-2">
              <NotificationDropdown 
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onClearAll={handleClearAllNotifications}
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hidden sm:flex">
                <Calendar className="w-4 h-4" />
                Extension Request
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-6 rounded-xl border border-border shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ArrowUpRight className="w-2 h-2" /> +12%
                  </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
              </motion.div>
            ))}
          </div>

          {activeTab === 'rooms' ? (
            <ManageRooms 
              rooms={rooms}
              onUpdateRoom={onUpdateRoom || (() => {})}
              onAddPackage={onAddPackage || (() => {})}
              onRemovePackage={onRemovePackage || (() => {})}
            />
          ) : activeTab === 'dashboard' ? (
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-xl font-bold mb-2">Dashboard View</h3>
              <p>Revenue analytics and booking statistics will be displayed here.</p>
            </div>
          ) : activeTab === 'customers' ? (
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-xl font-bold mb-2">Customer Database</h3>
              <p>Customer information and history will be displayed here.</p>
            </div>
          ) : (
            <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="font-bold">Recent Bookings</h3>
                <button className="text-xs font-bold text-primary hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Booking ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Room Type</th>
                      <th className="px-6 py-4">Stay Dates</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          <p>No bookings found matching your search.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="text-sm hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold">{booking.id}</td>
                          <td className="px-6 py-4 font-medium">{booking.customerName}</td>
                          <td className="px-6 py-4 text-muted-foreground">{booking.roomType}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span>{booking.checkIn}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">to {booking.checkOut}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold">${booking.total}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'confirm' })}
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                                  title="Confirm booking"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <button 
                                  onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'cancel' })}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                  title="Cancel booking"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-border">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, bookingId: '', action: 'cancel' })}
        onConfirm={() => {
          const status = confirmDialog.action === 'confirm' ? 'confirmed' : 'cancelled';
          handleStatusChange(confirmDialog.bookingId, status);
        }}
        title={confirmDialog.action === 'confirm' ? 'Confirm Booking' : 'Cancel Booking'}
        description={
          confirmDialog.action === 'confirm'
            ? `Are you sure you want to confirm booking ${confirmDialog.bookingId}? This will notify the customer via email.`
            : `Are you sure you want to cancel booking ${confirmDialog.bookingId}? This action cannot be undone and the customer will be notified.`
        }
        confirmText={confirmDialog.action === 'confirm' ? 'Confirm Booking' : 'Cancel Booking'}
        cancelText="Go Back"
        variant={confirmDialog.action === 'cancel' ? 'destructive' : 'default'}
      />
    </div>
  );
};