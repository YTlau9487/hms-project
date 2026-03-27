import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = '載入中...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-muted rounded-full"></div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-muted-foreground text-sm">{message}</p>
    </div>
  );
};