import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationsAPI, Notification, NotificationReader, NotificationReadersResponse, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Bell, Trash2, Check, CheckCheck, Filter, Megaphone, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { getNotificationMessage } from '../utils/notifications';

type FilterType = 'all' | 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'checked_in' | 'checked_out' | 'broadcast';

// Grouped notification type for display
interface GroupedNotification {
  groupId: string;
  representativeNotification: Notification;
  totalCount: number;
  readCount: number;
}

export const AdminNotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Readers modal state
  const [readersModalOpen, setReadersModalOpen] = useState(false);
  const [readersData, setReadersData] = useState<NotificationReadersResponse | null>(null);
  const [readersLoading, setReadersLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationsAPI.listAll();
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.error');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await notificationsAPI.delete(deleteId);
      toast.success(t('adminNotifications.deleted'));
      setDeleteId(null);
      await fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.deleteFailed');
      toast.error(errorMessage);
    }
  };

  const fetchReaders = useCallback(async (notificationId: number) => {
    try {
      setReadersLoading(true);
      const data = await notificationsAPI.getReaders(notificationId);
      setReadersData(data);
      setReadersModalOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : t('common.error');
      toast.error(errorMessage);
    } finally {
      setReadersLoading(false);
    }
  }, [t]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'booking_confirmed':
        return <Bell className="w-4 h-4 text-green-500" />;
      case 'booking_cancelled':
        return <Bell className="w-4 h-4 text-red-500" />;
      case 'checked_in':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'checked_out':
        return <Check className="w-4 h-4 text-orange-500" />;
      case 'broadcast':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'booking_created':
        return t('adminNotifications.types.bookingCreated');
      case 'booking_confirmed':
        return t('adminNotifications.types.bookingConfirmed');
      case 'booking_cancelled':
        return t('adminNotifications.types.bookingCancelled');
      case 'checked_in':
        return t('adminNotifications.types.checkedIn');
      case 'checked_out':
        return t('adminNotifications.types.checkedOut');
      case 'broadcast':
        return t('adminNotifications.types.broadcast');
      default:
        return type;
    }
  };

  // Group notifications by booking_id (for booking-related) or message (for broadcasts)
  const groupNotifications = (notifs: Notification[]): GroupedNotification[] => {
    const groups = new Map<string, GroupedNotification>();

    for (const notif of notifs) {
      const groupId = notif.booking_id !== null
        ? `booking_${notif.booking_id}_${notif.type}`
        : `message_${notif.message}_${notif.type}`;

      if (groups.has(groupId)) {
        const group = groups.get(groupId)!;
        group.totalCount += 1;
        if (notif.read) {
          group.readCount += 1;
        }
      } else {
        groups.set(groupId, {
          groupId,
          representativeNotification: notif,
          totalCount: 1,
          readCount: notif.read ? 1 : 0,
        });
      }
    }

    return Array.from(groups.values());
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const groupedNotifications = groupNotifications(filteredNotifications);

  const formatDate = (dateStr: string) => {
    // If no timezone info, treat as UTC (SQLite strips timezone from datetime)
    const hasTimezone = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10);
    const date = new Date(hasTimezone ? dateStr : `${dateStr}Z`);
    return date.toLocaleString(i18n.language, { hour12: true });
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && readersModalOpen) {
        setReadersModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readersModalOpen]);

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchNotifications} />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('adminNotifications.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('adminNotifications.subtitle')}</p>
        </div>
        <button
          onClick={() => toast.info(t('common.comingSoon'))}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
        >
          <Megaphone className="w-4 h-4" />
          {t('adminNotifications.broadcast')}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {(['all', 'booking_created', 'booking_confirmed', 'booking_cancelled', 'checked_in', 'checked_out', 'broadcast'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? t('adminNotifications.filters.all') : getNotificationTypeLabel(f)}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.type')}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.message')}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.date')}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.status')}</th>
              <th className="text-right px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groupedNotifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t('adminNotifications.noNotifications')}
                </td>
              </tr>
            ) : (
              groupedNotifications.map((group) => (
                <tr key={group.groupId} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(group.representativeNotification.type)}
                      <span className="text-sm">{getNotificationTypeLabel(group.representativeNotification.type)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{getNotificationMessage(group.representativeNotification, t)}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(group.representativeNotification.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => fetchReaders(group.representativeNotification.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      {t('adminNotifications.readSummary', {
                        readCount: group.readCount,
                        totalCount: group.totalCount,
                      })}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(group.representativeNotification.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors cursor-pointer text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {groupedNotifications.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">{t('adminNotifications.noNotifications')}</p>
        ) : (
          groupedNotifications.map((group) => (
            <motion.div
              key={group.groupId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getNotificationIcon(group.representativeNotification.type)}
                  <span className="text-sm font-medium">{getNotificationTypeLabel(group.representativeNotification.type)}</span>
                </div>
                <button
                  onClick={() => setDeleteId(group.representativeNotification.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors cursor-pointer text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-2">{getNotificationMessage(group.representativeNotification, t)}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{formatDate(group.representativeNotification.created_at)}</span>
              </div>
              <button
                onClick={() => fetchReaders(group.representativeNotification.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                {t('adminNotifications.readSummary', {
                  readCount: group.readCount,
                  totalCount: group.totalCount,
                })}
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Readers Detail Modal */}
      <AnimatePresence>
        {readersModalOpen && readersData && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setReadersModalOpen(false)}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('adminNotifications.readersTitle')}</h2>
                    <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">
                      {readersData.message_key
                        ? String(t(readersData.message_key, readersData.message_params || {}))
                        : readersData.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setReadersModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[60vh] px-6 py-4">
                  {readersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                    </div>
                  ) : readersData.readers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-sm">{t('adminNotifications.readersEmpty')}</p>
                  ) : (
                    <div className="space-y-3">
                      {readersData.readers.map((reader) => {
                        const fullName = reader.first_name && reader.last_name
                          ? `${reader.first_name} ${reader.last_name}`
                          : reader.name;
                        return (
                          <div
                            key={reader.user_id}
                            className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                reader.read
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {reader.read ? <CheckCheck className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                                {reader.read && reader.read_at && (
                                  <p className="text-xs text-gray-500">
                                    {t('adminNotifications.readAt')}: {formatDate(reader.read_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              reader.read
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {reader.read ? t('adminNotifications.status.read') : t('adminNotifications.status.unread')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        title={t('adminNotifications.deleteTitle')}
        description={t('adminNotifications.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        variant="destructive"
      />
    </div>
  );
};