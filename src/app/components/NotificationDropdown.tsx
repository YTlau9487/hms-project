import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { notificationsAPI, getErrorMessage, Notification as APINotification } from '../services/api';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'check-in' | 'check-out' | 'cancellation' | 'booking_created' | 'booking_cancelled' | 'checked_in' | 'checked_out';
  message: string;
  customerName: string;
  bookingId: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDropdownProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

// Play a pleasant two-tone chime notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone (higher pitch)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioContext.currentTime);
    gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.15);
    
    // Second tone (lower pitch, slightly delayed)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, audioContext.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, audioContext.currentTime);
    gain2.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
    osc2.start(audioContext.currentTime + 0.12);
    osc2.stop(audioContext.currentTime + 0.35);
  } catch {
    // Audio not supported
  }
};

export const NotificationDropdown = ({ 
  notifications: propNotifications, 
  onMarkAsRead, 
  onClearAll 
}: NotificationDropdownProps) => {
  const { t } = useTranslation();
  const [apiNotifications, setApiNotifications] = useState<APINotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadCountRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notifications = propNotifications || [];
  const hasApiNotifications = apiNotifications.length > 0;
  const displayNotifications = hasApiNotifications ? apiNotifications : notifications;
  const unreadCount = hasApiNotifications 
    ? apiNotifications.filter(n => !n.read).length 
    : notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsAPI.list();
      setApiNotifications(data);
      
      // Check for new unread notifications
      const newUnreadCount = data.filter(n => !n.read).length;
      if (newUnreadCount > prevUnreadCountRef.current && prevUnreadCountRef.current >= 0) {
        setHasNewNotification(true);
        playNotificationSound();
        setTimeout(() => setHasNewNotification(false), 3000);
      }
      prevUnreadCountRef.current = newUnreadCount;
    } catch (err) {
      // Silently fail - notifications are not critical
    }
  }, []);

  useEffect(() => {
    if (!propNotifications) {
      fetchNotifications();
      
      // Poll every 10 seconds for new notifications
      intervalRef.current = setInterval(fetchNotifications, 10000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [propNotifications, fetchNotifications]);

  const handleMarkAsRead = async (id: string | number) => {
    if (hasApiNotifications) {
      try {
        await notificationsAPI.markRead(Number(id));
        setApiNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      } catch (err) {
        // Silently fail
      }
    } else if (onMarkAsRead) {
      onMarkAsRead(String(id));
    }
  };

  const handleClearAll = async () => {
    if (hasApiNotifications) {
      try {
        await notificationsAPI.markAllRead();
        setApiNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        // Silently fail
      }
    } else if (onClearAll) {
      onClearAll();
    }
    toast.info(t('notifications.clearAll'));
  };

  const getIcon = (type: Notification['type'] | APINotification['type']) => {
    switch (type) {
      case 'check-in':
      case 'checked_in':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'check-out':
      case 'checked_out':
        return <LogOut className="w-4 h-4 text-red-600" />;
      case 'cancellation':
      case 'booking_cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'booking_created':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification['type'] | APINotification['type']) => {
    switch (type) {
      case 'check-in':
      case 'checked_in':
        return 'bg-green-50 border-green-200';
      case 'check-out':
      case 'checked_out':
        return 'bg-red-50 border-red-200';
      case 'cancellation':
      case 'booking_cancelled':
        return 'bg-red-50 border-red-200';
      case 'booking_created':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-muted border-border';
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.justNow');
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
          <Bell 
            className={`w-5 h-5 ${hasNewNotification ? 'animate-bounce' : ''}`}
          />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('notifications.title')}</span>
          {displayNotifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-primary hover:underline font-normal"
            >
              {t('notifications.clearAll')}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">{t('notifications.loading')}</p>
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-1 py-1">
            {displayNotifications.map((notification) => {
              const isApi = 'type' in notification && typeof notification.type === 'string' && 
                ['booking_created', 'booking_cancelled', 'checked_in', 'checked_out'].includes(notification.type);
              const id = isApi ? (notification as APINotification).id : (notification as Notification).id;
              const type = notification.type;
              const message = notification.message;
              const bookingId = isApi 
                ? (notification as APINotification).booking_id 
                  ? `BK-${(notification as APINotification).booking_id}` 
                  : ''
                : (notification as Notification).bookingId;
              const timestamp = isApi 
                ? formatTimestamp((notification as APINotification).created_at)
                : (notification as Notification).timestamp;
              const read = isApi 
                ? (notification as APINotification).read 
                : (notification as Notification).read;

              return (
                <DropdownMenuItem
                  key={id}
                  onClick={() => handleMarkAsRead(id)}
                  className={`cursor-pointer ${!read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-3 w-full py-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(type)} flex-shrink-0 mt-0.5`}>
                      {getIcon(type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight mb-1">
                        {message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {bookingId && <span className="font-mono">{bookingId}</span>}
                        {bookingId && <span>•</span>}
                        <span>{timestamp}</span>
                      </div>
                    </div>
                    {!read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};