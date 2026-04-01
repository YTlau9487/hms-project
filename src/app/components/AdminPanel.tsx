import React, { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowUpRight,
  TrendingUp,
  CalendarCheck,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ManageRooms } from './ManageRooms';
import { Room, RoomPackage } from './RoomCard';
import { Booking, DashboardStats } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AdminPanelProps {
  rooms?: Room[];
  bookings?: Booking[];
  stats?: DashboardStats | null;
  isLoading?: boolean;
  onUpdateRoom?: (roomId: string, updates: Partial<Room>) => void;
  onAddPackage?: (roomId: string, packageData: RoomPackage) => void;
  onRemovePackage?: (roomId: string, packageId: string) => void;
  onStatusChange?: (bookingId: number, status: 'confirmed' | 'cancelled') => void;
}

export const AdminPanel = ({ 
  rooms = [], 
  bookings = [], 
  stats,
  isLoading = false,
  onUpdateRoom, 
  onAddPackage, 
  onRemovePackage,
  onStatusChange 
}: AdminPanelProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('bookings');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: number;
    action: 'confirm' | 'cancel';
  }>({ isOpen: false, bookingId: 0, action: 'cancel' });

  const displayStats = stats ? [
    { label: t('adminPanel.totalRevenue'), value: `$${stats.total_revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600' },
    { label: t('adminPanel.activeBookings'), value: String(stats.active_bookings), icon: CalendarCheck, color: 'text-blue-600' },
    { label: t('adminPanel.pendingRequests'), value: String(stats.pending_bookings), icon: Clock, color: 'text-orange-600' },
    { label: t('adminPanel.totalUsers'), value: String(stats.total_users), icon: Users, color: 'text-purple-600' },
  ] : [
    { label: t('adminPanel.totalRevenue'), value: '--', icon: TrendingUp, color: 'text-green-600' },
    { label: t('adminPanel.activeBookings'), value: '--', icon: CalendarCheck, color: 'text-blue-600' },
    { label: t('adminPanel.pendingRequests'), value: '--', icon: Clock, color: 'text-orange-600' },
    { label: t('adminPanel.totalUsers'), value: '--', icon: Users, color: 'text-purple-600' },
  ];

  const handleStatusChange = (id: number, status: 'confirmed' | 'cancelled') => {
    if (onStatusChange) {
      onStatusChange(id, status);
    }

    const booking = bookings.find(b => b.id === id);
    if (booking) {
      const newNotification: Notification = {
        id: `N-${Date.now()}`,
        type: status === 'cancelled' ? 'cancellation' : 'check-in',
        message: `Booking #${id} has been ${status}`,
        customerName: `User #${booking.user_id}`,
        bookingId: `BK-${id}`,
        timestamp: 'Just now',
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }

    setConfirmDialog({ isOpen: false, bookingId: 0, action: 'cancel' });
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
      `bk-${booking.id}`.includes(query) ||
      `user #${booking.user_id}`.includes(query) ||
      (booking.room?.name || '').toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-muted/30">
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('adminPanel.title')}</h1>
              <p className="text-muted-foreground">{t('adminPanel.subtitle')}</p>
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
                  placeholder={t('adminPanel.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayStats.map((stat, i) => (
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
                  <ArrowUpRight className="w-2 h-2" /> {t('adminPanel.live')}
                </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'rooms' ? (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ManageRooms
                  rooms={rooms}
                  onUpdateRoom={onUpdateRoom || (() => {})}
                  onAddPackage={onAddPackage || (() => {})}
                  onRemovePackage={onRemovePackage || (() => {})}
                />
              </motion.div>
            ) : activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12 text-muted-foreground"
              >
                <h3 className="text-xl font-bold mb-2">Dashboard View</h3>
                <p>Revenue analytics and booking statistics will be displayed here.</p>
              </motion.div>
            ) : activeTab === 'customers' ? (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12 text-muted-foreground"
              >
                <h3 className="text-xl font-bold mb-2">Customer Database</h3>
                <p>Customer information and history will be displayed here.</p>
              </motion.div>
            ) : (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-background rounded-xl border border-border shadow-sm overflow-hidden"
              >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold">{t('adminPanel.recentBookings')}</h3>
            </div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.bookingId')}</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.guest')}</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.room')}</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.stayDates')}</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.status')}</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.amount')}</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('adminPanel.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          <p>{t('adminPanel.loadingBookings')}</p>
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          <p>{t('adminPanel.noBookingsFound')}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="text-sm hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold">BK-{booking.id}</td>
                          <td className="px-6 py-4 font-medium">User #{booking.user_id}</td>
                          <td className="px-6 py-4 text-muted-foreground">{booking.room?.name || 'Unknown'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span>{booking.check_in}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">to {booking.check_out}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status === 'confirmed' ? t('adminBookings.confirmed') : booking.status === 'pending' ? t('adminBookings.pending') : t('adminBookings.cancelled')}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold">${booking.total_price}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'confirm' })}
                                  className="p-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                                  title={t('adminPanel.confirmBooking')}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <button 
                                  onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'cancel' })}
                                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                                  title={t('adminPanel.cancelBooking')}
                                >
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </button>
                              )}
                              <button className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer" title={t('adminPanel.actions')}>
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {isLoading ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>{t('adminPanel.loadingBookings')}</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>{t('adminPanel.noBookingsFound')}</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">BK-{booking.id}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status === 'confirmed' ? t('adminBookings.confirmed') : booking.status === 'pending' ? t('adminBookings.pending') : t('adminBookings.cancelled')}
                        </span>
                      </div>
                      <div className="text-sm font-medium">User #{booking.user_id}</div>
                      <div className="text-sm text-muted-foreground">{booking.room?.name || 'Unknown'}</div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-muted-foreground">
                          {booking.check_in} – {booking.check_out}
                        </div>
                        <div className="font-semibold">${booking.total_price}</div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'confirm' })}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t('adminPanel.confirm')}
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button 
                            onClick={() => setConfirmDialog({ isOpen: true, bookingId: booking.id, action: 'cancel' })}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('adminPanel.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

        <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, bookingId: 0, action: 'cancel' })}
        onConfirm={() => {
          const status = confirmDialog.action === 'confirm' ? 'confirmed' : 'cancelled';
          handleStatusChange(confirmDialog.bookingId, status);
        }}
        title={confirmDialog.action === 'confirm' ? t('adminPanel.confirmBooking') : t('adminPanel.cancelBooking')}
        description={
          confirmDialog.action === 'confirm'
            ? t('adminPanel.confirmBookingDesc', { id: confirmDialog.bookingId })
            : t('adminPanel.cancelBookingDesc', { id: confirmDialog.bookingId })
        }
        confirmText={confirmDialog.action === 'confirm' ? t('adminPanel.confirmBookingBtn') : t('adminPanel.cancelBookingBtn')}
        cancelText={t('adminPanel.goBack')}
        variant={confirmDialog.action === 'cancel' ? 'destructive' : 'default'}
      />
    </div>
  );
};