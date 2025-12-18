import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { WeekGrid } from '@/components/calendar/WeekGrid';
import { DayTimeline } from '@/components/calendar/DayTimeline';

export const CalendarPane = () => {
  const { viewMode } = useStore();

  return (
    <div className={clsx(
      "relative h-full w-full",
      "bg-white dark:bg-gray-900",
      "rounded-3xl",
      "shadow-xl shadow-gray-200/50 dark:shadow-black/50",
      "border border-gray-100 dark:border-gray-800",
      "overflow-hidden",
      "flex flex-col"
    )}>
      {/* View Content with Transitions */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewMode === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <MonthGrid />
            </motion.div>
          )}
          {viewMode === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <WeekGrid />
            </motion.div>
          )}
          {viewMode === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <DayTimeline />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
