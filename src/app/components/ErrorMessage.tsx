import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ 
  message,
  onRetry 
}: ErrorMessageProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-destructive/10 rounded-full p-4 mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <p className="text-destructive text-center font-medium mb-2">{t('common.errorTitle')}</p>
      <p className="text-muted-foreground text-center text-sm mb-4">{message || t('common.error')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry')}
        </button>
      )}
    </div>
  );
};
