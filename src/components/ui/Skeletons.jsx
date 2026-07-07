import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200/70 dark:bg-slate-700/50 rounded-lg ${className}`} />
);

export const SkeletonProductCard = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-5 flex flex-col h-full">
    <div className="aspect-[1.5] rounded-[1.5rem] mb-5 animate-pulse bg-gray-200/70 dark:bg-slate-700/50" />
    <Skeleton className="h-2.5 w-20 mb-2" />
    <Skeleton className="h-4 w-full mb-1.5" />
    <Skeleton className="h-4 w-2/3 mb-5" />
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-14" />
    </div>
    <div className="flex items-center gap-2 mt-auto">
      <Skeleton className="h-12 flex-grow rounded-xl" />
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

export const SkeletonProductGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(count)].map((_, i) => <SkeletonProductCard key={i} />)}
  </div>
);

export const SkeletonRows = ({ rows = 6, cols = 5 }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        {[...Array(cols)].map((_, j) => (
          <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-40' : 'flex-1'}`} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonMetricCards = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem]">
        <Skeleton className="w-9 h-9 rounded-xl mb-3" />
        <Skeleton className="h-2 w-16 mb-2" />
        <Skeleton className="h-6 w-20" />
      </div>
    ))}
  </div>
);
