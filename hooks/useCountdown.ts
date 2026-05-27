import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  initialTime: number; // in seconds
  onExpire?: () => void;
  autoStart?: boolean;
}

export function useCountdown({ 
  initialTime, 
  onExpire, 
  autoStart = true 
}: UseCountdownOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isExpired, setIsExpired] = useState(false);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsExpired(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setTimeRemaining(newTime ?? initialTime);
    setIsRunning(autoStart);
    setIsExpired(false);
  }, [initialTime, autoStart]);

  const restart = useCallback(() => {
    setTimeRemaining(initialTime);
    setIsRunning(true);
    setIsExpired(false);
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          setIsRunning(false);
          setIsExpired(true);
          onExpire?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onExpire]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    isRunning,
    isExpired,
    formattedTime: formatTime(timeRemaining),
    start,
    stop,
    reset,
    restart
  };
}
