import React, { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  confirmButtonClassName?: string;
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText,
  cancelText,
  variant = 'default',
  icon: customIcon,
  iconColor,
  iconBgColor,
  confirmButtonClassName,
}: ConfirmationDialogProps) => {
  const { t } = useTranslation();
  
  // Determine icon to show
  const IconComponent = customIcon || (variant === 'destructive' ? AlertTriangle : null);
  const color = iconColor || (variant === 'destructive' ? 'text-red-600' : '');
  const bgColor = iconBgColor || (variant === 'destructive' ? 'bg-red-100' : '');
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className={`p-2 ${bgColor} rounded-full`}>
                <IconComponent className={`w-5 h-5 ${color}`} />
              </div>
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="pt-2">
              {description}
            </AlertDialogDescription>
          )}
          {children && <div className="pt-2">{children}</div>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{cancelText || t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={confirmButtonClassName || (variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : '')}
          >
            {confirmText || t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
