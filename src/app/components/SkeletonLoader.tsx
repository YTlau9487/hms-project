import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonBlock = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="h-64 bg-muted animate-pulse" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-5 w-10 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <SkeletonBlock className="h-8 w-20" />
        <div className="flex gap-4">
          <SkeletonBlock className="h-8 w-16" />
          <SkeletonBlock className="h-8 w-20" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonTableRow = ({ cols = 6 }: { cols?: number }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <SkeletonBlock className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const SkeletonHero = () => (
  <div className="relative w-full min-h-[60vh] md:min-h-[65vh] mb-6 md:mb-8 bg-muted animate-pulse">
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-12 md:pb-16">
      <SkeletonBlock className="h-10 w-48 mb-4" />
      <SkeletonBlock className="h-14 w-96 mb-4" />
      <SkeletonBlock className="h-6 w-64 mb-5" />
      <div className="flex gap-3 mb-6">
        <SkeletonBlock className="h-8 w-24" />
        <SkeletonBlock className="h-8 w-24" />
        <SkeletonBlock className="h-8 w-24" />
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-12 w-36" />
        <SkeletonBlock className="h-12 w-36" />
      </div>
    </div>
  </div>
);