import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationsAPI, Notification, getErrorMessage } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Bell, Trash2, Check, CheckCheck, Filter, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type FilterType = 'all' | 'booking_created' | 'booking_cancelled' | 'checked_in' | 'checked_out' | 'broadcast';

export const AdminNotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
        return <Bell className="w-4 h-4 text-blue-500" />;
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

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

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
        {(['all', 'booking_created', 'booking_cancelled', 'checked_in', 'checked_out', 'broadcast'] as FilterType[]).map((f) => (
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
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.user')}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.date')}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.status')}</th>
              <th className="text-right px-4 py-3 text-sm font-medium">{t('adminNotifications.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('adminNotifications.noNotifications')}
                </td>
              </tr>
            ) : (
              filteredNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="text-sm">{getNotificationTypeLabel(notification.type)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{notification.message}</td>
                  <td className="px-4 py-3 text-sm">User #{notification.user_id}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(notification.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      notification.read
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {notification.read ? <CheckCheck className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                      {notification.read ? t('adminNotifications.status.read') : t('adminNotifications.status.unread')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(notification.id)}
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
        {filteredNotifications.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">{t('adminNotifications.noNotifications')}</p>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <span className="text-sm font-medium">{getNotificationTypeLabel(notification.type)}</span>
                </div>
                <button
                  onClick={() => setDeleteId(notification.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors cursor-pointer text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-2">{notification.message}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>User #{notification.user_id}</span>
                <span>{formatDate(notification.created_at)}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  notification.read
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {notification.read ? <CheckCheck className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                  {notification.read ? t('adminNotifications.status.read') : t('adminNotifications.status.unread')}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

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