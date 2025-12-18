import clsx from 'clsx';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useScrollZoom } from '@/hooks/useScrollZoom';
import { DroppableDay } from '@/components/dnd/DroppableDay';
import { useTranslation } from 'react-i18next';
import { useDateLocale } from '@/i18n/dateFns';

export const MonthGrid = () => {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { currentDate, tasks, setCurrentDate, dailyActivity } = useStore();
  useScrollZoom(); // No ref needed for Month view (always zooms)
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });

  // Heatmap Logic
  const getIntensity = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const minutes = dailyActivity?.[dateKey] || 0;
    
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    return 4;
  };

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-emerald-50 dark:bg-emerald-900/30';
      case 2: return 'bg-emerald-100 dark:bg-emerald-900/50';
      case 3: return 'bg-emerald-200 dark:bg-emerald-800/70';
      case 4: return 'bg-emerald-300 dark:bg-emerald-700/90';
      default: return 'bg-white dark:bg-gray-800/50';
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
        </h2>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>{t('calendar.heatmap_less')}</span>
            <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-gray-100 dark:border-gray-800" title="0-30m" />
                <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-900/40" title="30-60m" />
                <div className="w-4 h-4 rounded bg-emerald-200 dark:bg-emerald-800/60 border border-emerald-200 dark:border-emerald-800/60" title="1-2h" />
                <div className="w-4 h-4 rounded bg-emerald-300 dark:bg-emerald-700/80 border border-emerald-300 dark:border-emerald-700/80" title="2h+" />
            </div>
            <span>{t('calendar.heatmap_more')}</span>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day.toString()} className="text-center text-xs font-medium text-gray-400 uppercase">
            {format(day, 'ccc', { locale: dateLocale })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1 min-h-0">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.dates?.includes(dateStr));
          const maxTasks = 3; // Limit tasks to show
          const visibleTasks = dayTasks.slice(0, maxTasks);
          const hasMore = dayTasks.length > maxTasks;
          
          return (
            <DroppableDay
              key={day.toString()}
              date={day}
              onClick={() => setCurrentDate(day)}
              className={clsx(
                "relative p-1.5 rounded-lg transition-all duration-300 flex gap-1 overflow-hidden group cursor-pointer",
                !isSameMonth(day, monthStart) && "opacity-40 grayscale",
                isSameDay(day, currentDate) ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-950 bg-blue-50/50 dark:bg-blue-900/30" : 
                isToday(day) ? "ring-2 ring-blue-300 ring-offset-1 dark:ring-offset-gray-950 bg-blue-50/30 dark:bg-blue-900/20" : 
                getIntensityColor(getIntensity(day)),
                "hover:shadow-md hover:scale-[1.02] hover:z-10"
              )}
            >
              {/* Date Number (Left) */}
              <div className={clsx(
                "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold",
                isToday(day) ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
              )}>
                {format(day, 'd')}
              </div>
              
              {/* Task List (Right) */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                {visibleTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={clsx(
                      "h-5 px-1.5 rounded-full text-[10px] flex items-center truncate border",
                      task.status === 'done' ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 line-through" :
                      task.priority === 'high' ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/30" :
                      task.priority === 'medium' ? "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900/30" :
                      "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30"
                    )}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {hasMore && (
                  <div className="h-4 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                    ...
                  </div>
                )}
              </div>
            </DroppableDay>
          );
        })}
      </div>
    </div>
  );
};
