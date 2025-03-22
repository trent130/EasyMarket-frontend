'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({
  variant = 'spinner',
  size = 'md',
  className,
  ...props
}: LoadingStateProps) => {
  if (variant === 'skeleton') {
    return (
      <div
        className={cn(
          'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
          className
        )}
        {...props}
      />
    );
  }

  if (variant === 'progress') {
    return (
      <div
        className={cn(
          'h-1 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden rounded',
          className
        )}
        {...props}
      >
        <div className="h-full bg-primary animate-progress-indeterminate" />
      </div>
    );
  }

  // Default spinner
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin',
          spinnerSizes[size]
        )}
      />
    </div>
  );
}; 