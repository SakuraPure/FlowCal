import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Play, Pause, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import TimerWorker from '../../workers/timer.worker?worker';

export const TimerDisplay = () => {
  const { activeTimer, pauseTimer, stopTimer, tickTimer, tasks } = useStore();

  useEffect(() => {
    let worker: Worker | null = null;

    if (activeTimer?.status === 'running') {
      // Initialize Web Worker using Vite import
      worker = new TimerWorker();
      
      worker.onmessage = (e) => {
        if (e.data === 'tick') {
          tickTimer();
        }
      };

      worker.postMessage('start');
    }

    return () => {
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
    };
  }, [activeTimer?.status, tickTimer]);

  if (!activeTimer) return null;

  const task = tasks.find(t => t.id === activeTimer.taskId);

  // Calculate time display
  const isPomodoro = activeTimer.type === 'pomodoro';
  const totalSeconds = isPomodoro ? activeTimer.duration * 60 : activeTimer.elapsed;
  const remainingSeconds = isPomodoro ? totalSeconds - activeTimer.elapsed : activeTimer.elapsed;
  
  // Format MM:SS
  const mins = Math.floor(Math.abs(remainingSeconds) / 60);
  const secs = Math.floor(Math.abs(remainingSeconds) % 60);
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const phaseLabel = !isPomodoro ? 'Stopwatch' : 
                     activeTimer.phase === 'short_break' ? 'Short Break' :
                     activeTimer.phase === 'long_break' ? 'Long Break' :
                     'Focus Session';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={clsx(
        "flex flex-col items-center justify-center p-4 sm:p-8 h-full w-full rounded-3xl backdrop-blur-xl border shadow-2xl transition-colors duration-500 overflow-hidden",
        activeTimer.phase === 'short_break' || activeTimer.phase === 'long_break' 
          ? "bg-green-50/90 dark:bg-green-900/50 border-green-100 dark:border-green-800 shadow-green-500/10"
          : "bg-white/90 dark:bg-gray-900/90 border-white/50 dark:border-white/10 shadow-indigo-500/10"
      )}
    >
      <div className={clsx(
        "text-xs sm:text-sm font-bold mb-1 sm:mb-2 uppercase tracking-widest",
         activeTimer.phase?.includes('break') ? "text-green-600 dark:text-green-400" : "text-indigo-500 dark:text-indigo-400"
      )}>
        {phaseLabel}
      </div>
      
      <div className="text-gray-800 dark:text-gray-100 font-bold text-5xl sm:text-7xl font-mono tracking-tight mb-2 sm:mb-4 tabular-nums relative">
        {timeString}
        {isPomodoro && remainingSeconds < 0 && (
            <span className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 text-[10px] sm:text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 sm:py-1 rounded-full">Overtime</span>
        )}
      </div>

      {task && (
        <div className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 font-medium mb-4 sm:mb-8 text-center max-w-sm truncate px-4">
          {task.title}
        </div>
      )}

      <div className="flex items-center gap-6">
        <button 
          onClick={pauseTimer}
          className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all hover:scale-105 active:scale-95"
          title={activeTimer.status === 'running' ? 'Pause' : 'Resume'}
        >
          {activeTimer.status === 'running' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        
        <button 
          onClick={stopTimer}
          className="p-4 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all hover:scale-105 active:scale-95"
          title="Stop"
        >
          <Square size={24} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );
};
