import clsx from 'clsx';
import { format, isSameDay } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useScrollZoom } from '@/hooks/useScrollZoom';
import { useRef } from 'react';
import { useDateLocale } from '@/i18n/dateFns';
import { useTranslation } from 'react-i18next';


export const DayTimeline = () => {
  /* Existing Active Timer Logic */
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { currentDate, activeTimer, tasks, sessions } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollZoom(containerRef);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 80;

  // Varied Palette for Sessions
  const SESSION_PALETTE = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-800 dark:text-blue-200' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-500', text: 'text-emerald-800 dark:text-emerald-200' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-800 dark:text-orange-200' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-800 dark:text-purple-200' },
    { bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-500', text: 'text-rose-800 dark:text-rose-200' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-800 dark:text-cyan-200' },
    { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-800 dark:text-amber-200' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30', border: 'border-indigo-500', text: 'text-indigo-800 dark:text-indigo-200' },
    { bg: 'bg-lime-100 dark:bg-lime-900/30', border: 'border-lime-500', text: 'text-lime-800 dark:text-lime-200' },
    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', border: 'border-fuchsia-500', text: 'text-fuchsia-800 dark:text-fuchsia-200' },
  ];

  // 1. Get Today's Sessions (Sorted by time)
  const todaysSessions = sessions
    ?.filter(s => isSameDay(new Date(s.startTime), currentDate))
    .sort((a, b) => a.startTime - b.startTime) || [];

  // 2. Active Timer Style
  const getActiveTimerStyle = () => {
    /* ... (unchanged) */
    if (!activeTimer || activeTimer.status !== 'running') return null;
    
    const startDate = new Date(activeTimer.startTime);
    if (!isSameDay(startDate, currentDate)) return null;

    const startHour = startDate.getHours();
    const startMin = startDate.getMinutes();
    const startTimeInMinutes = startHour * 60 + startMin;
    
    let durationInMinutes = 30; 
    if (activeTimer.type === 'pomodoro') {
        durationInMinutes = activeTimer.duration;
    } else {
        durationInMinutes = Math.max(15, activeTimer.elapsed / 60);
    }

    const top = startTimeInMinutes * (hourHeight / 60);
    const height = durationInMinutes * (hourHeight / 60);

    return { top, height };
  };

  const activeTimerStyle = getActiveTimerStyle();
  const activeTask = activeTimer ? tasks.find(t => t.id === activeTimer.taskId) : null;

  return (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {format(currentDate, 'EEEE, MMMM d', { locale: dateLocale })}
        </h2>
      </div>

      {/* Timeline Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto no-scrollbar relative bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800/50 shadow-sm pt-4">
        <div className="relative min-h-[1920px]"> {/* 24 * 80px */}
            
            {/* Grid Background */}
            {hours.map((hour) => (
            <div key={hour} className="absolute left-0 right-0 flex items-start group" style={{ top: hour * hourHeight, height: hourHeight }}>
                <div className="w-16 text-xs text-gray-400 dark:text-gray-600 -mt-2.5 text-right pr-4 flex-shrink-0 select-none">
                {format(new Date().setHours(hour, 0), 'p', { locale: dateLocale })}
                </div>
                <div className="flex-1 border-t border-gray-100 dark:border-gray-800 w-full" />
            </div>
            ))}

            {/* Historical Sessions */}
            {todaysSessions.map((session, index) => {
                const task = tasks.find(t => t.id === session.taskId);
                if (!task) return null;
                
                // Varied Color Strategy
                const styles = SESSION_PALETTE[index % SESSION_PALETTE.length];
                
                const startDate = new Date(session.startTime);
                const startMin = startDate.getHours() * 60 + startDate.getMinutes();
                const top = startMin * (hourHeight / 60);
                const sessionHeight = session.duration * (hourHeight / 60);
                const height = Math.max(24, sessionHeight); // Min 24px height
                const isSmall = height < 50;

                return (
                    <div 
                        key={session.id}
                        className={clsx(
                            "absolute left-20 right-4 rounded-lg border-l-4 shadow-sm z-0 overflow-hidden hover:opacity-90 transition-opacity flex",
                            styles.bg, styles.border, // Apply dynamic colors from palette
                            isSmall ? "flex-row items-center gap-2 px-2" : "flex-col justify-center p-2"
                        )}
                        style={{ top, height }}
                    >
                         <h4 className={clsx("font-semibold text-xs truncate flex-1", styles.text)}>{task.title}</h4>
                         <span className={clsx("text-[10px] whitespace-nowrap opacity-80", styles.text)}>{Math.round(session.duration)}m</span>
                    </div>
                );
            })}

            {/* Active Timer Block */}
            {activeTimerStyle && activeTask && (
                <div 
                    className="absolute left-20 right-4 rounded-xl bg-blue-600/10 border-l-4 border-blue-600 p-3 shadow-md backdrop-blur-sm z-10 flex flex-col justify-center overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ 
                        top: activeTimerStyle.top, 
                        height: activeTimerStyle.height,
                        minHeight: '40px' 
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">{t('focus.focusing_now')}</span>
                    </div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 truncate">{activeTask.title}</h4>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
