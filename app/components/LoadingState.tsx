'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Skeleton, LinearProgress, Fade } from '@mui/material';

interface LoadingStateProps {
  fullScreen?: boolean;
  message?: string;
  showSkeleton?: boolean;
  skeletonCount?: number;
  progress?: number;
  showProgress?: boolean;
  timeout?: number;
  variant?: 'circular' | 'linear' | 'skeleton';
  customPlaceholder?: React.ReactNode;
  onTimeout?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  fullScreen = false,
  message = 'Loading...',
  showSkeleton = false,
  skeletonCount = 3,
  progress,
  showProgress = false,
  timeout,
  variant = 'circular',
  customPlaceholder,
  onTimeout,
}) => {
  const [show, setShow] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // Add a small delay before showing the loading state to prevent flashing
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        onTimeout?.();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  useEffect(() => {
    if (showProgress && !progress) {
      const interval = setInterval(() => {
        setProgressValue((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prev + 10, 95); // Never reach 100% automatically
        });
      }, 500);
      return () => clearInterval(interval);
    } else if (progress !== undefined) {
      setProgressValue(progress);
    }
  }, [showProgress, progress]);

  const renderProgress = () => {
    if (variant === 'linear') {
      return (
        <LinearProgress
          variant={progress !== undefined ? 'determinate' : 'indeterminate'}
          value={progressValue}
          sx={{ width: '100%', maxWidth: 400, mb: 2 }}
        />
      );
    }
    return (
      <CircularProgress
        variant={progress !== undefined ? 'determinate' : 'indeterminate'}
        value={progressValue}
        size={40}
      />
    );
  };

  const renderSkeletons = () => (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={100}
          sx={{
            mb: 2,
            borderRadius: 1,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.4,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );

  const renderContent = () => {
    if (customPlaceholder) {
      return customPlaceholder;
    }

    if (variant === 'skeleton' || showSkeleton) {
      return renderSkeletons();
    }

    return (
      <>
        {renderProgress()}
        {message && (
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              animation: 'fadeIn 0.5s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            {timeoutReached ? 'This is taking longer than expected...' : message}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          ...(fullScreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: 9999,
          }),
        }}
      >
        {renderContent()}
      </Box>
    </Fade>
  );
}; 