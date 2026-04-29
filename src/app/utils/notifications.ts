import { TFunction } from 'i18next';
import { Notification } from '../services/api';

/**
 * Get the translated notification message.
 * If message_key exists, use i18n lookup with params interpolation.
 * Otherwise, fall back to the raw message string (for backward compatibility).
 */
export const getNotificationMessage = (
  notification: Notification,
  t: TFunction
): string => {
  if (notification.message_key) {
    return String(t(notification.message_key, notification.message_params || {}));
  }
  return notification.message;
};
