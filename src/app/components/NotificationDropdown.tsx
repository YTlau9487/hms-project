import React from 'react';
import { Bell, CheckCircle2, XCircle, LogIn, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion } from 'motion/react';

export interface Notification {
  id: string;
  type: 'check-in' | 'check-out' | 'cancellation';
  message: string;
  customerName: string;
  bookingId: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDropdown = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}: NotificationDropdownProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'check-in':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'check-out':
        return <LogOut className="w-4 h-4 text-blue-600" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'check-in':
        return 'bg-green-50 border-green-200';
      case 'check-out':
        return 'bg-blue-50 border-blue-200';
      case 'cancellation':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-primary hover:underline font-normal"
            >
              Clear all
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-1 py-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => onMarkAsRead(notification.id)}
                className={`cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start gap-3 w-full py-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(notification.type)} flex-shrink-0 mt-0.5`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight mb-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{notification.bookingId}</span>
                      <span>•</span>
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
