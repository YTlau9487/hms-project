import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ 
  message = '無法取得資料，請稍後再試',
  onRetry 
}: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-destructive/10 rounded-full p-4 mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <p className="text-destructive text-center font-medium mb-2">發生錯誤</p>
      <p className="text-muted-foreground text-center text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          重新載入
        </button>
      )}
    </div>
  );
};