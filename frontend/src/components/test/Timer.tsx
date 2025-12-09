import React, { useEffect, useRef } from 'react';
import { useTest } from '../../contexts/TestContext';
import './Timer.css';

const DEFAULT_INTERVAL_SECONDS = 420; // 7 minutes

interface TimerProps {
  mode: 'countdown' | 'countup';
  time: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
  onIntervalReached?: (intervalNumber: number) => void;
  intervalSeconds?: number;
}

export default function Timer({ mode, time, onTimeUp, isPaused = false, onIntervalReached, intervalSeconds = DEFAULT_INTERVAL_SECONDS }: TimerProps) {
  const { dispatch } = useTest();
  const lastIntervalRef = useRef(0);

  useEffect(() => {
    // Countdown mode: decrement every second, trigger onTimeUp at 0
    if (mode === 'countdown') {
      if (time <= 0) {
        onTimeUp?.();
        return;
      }
      const timer = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', payload: time - 1 });
      }, 1000);
      return () => clearInterval(timer);
    }

    // Countup mode: increment every second (unless paused)
    if (mode === 'countup' && !isPaused) {
      const timer = setInterval(() => {
        dispatch({ type: 'UPDATE_ELAPSED_TIME' });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, time, dispatch, onTimeUp, isPaused]);

  // Check for interval in a separate effect (uses customizable interval duration)
  useEffect(() => {
    if (mode === 'countup' && !isPaused && time > 0) {
      const currentInterval = Math.floor(time / intervalSeconds);
      if (currentInterval > lastIntervalRef.current) {
        lastIntervalRef.current = currentInterval;
        onIntervalReached?.(currentInterval);
      }
    }
  }, [mode, time, isPaused, onIntervalReached, intervalSeconds]);

  // Reset interval tracking when test restarts
  useEffect(() => {
    if (time === 0) {
      lastIntervalRef.current = 0;
    }
  }, [time]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Warning styles only for countdown mode
  const isLowTime = mode === 'countdown' && time < 300;
  const isCriticalTime = mode === 'countdown' && time < 60;

  return (
    <div
      className={`timer ${mode} ${isLowTime ? 'low' : ''} ${isCriticalTime ? 'critical' : ''} ${isPaused ? 'paused' : ''}`}
    >
      <span className="timer-icon">{isPaused ? '⏸' : '⏱'}</span>
      <span className="timer-value">{formatTime(time)}</span>
    </div>
  );
}
