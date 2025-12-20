import clsx from 'clsx';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '@/store/useStore';
import { useScrollZoom } from '@/hooks/useScrollZoom';
import { useRef } from 'react';
import { useDateLocale } from '@/i18n/dateFns';

export const WeekGrid = () => {
  const dateLocale = useDateLocale();
  const { currentDate, tasks } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollZoom(containerRef);
  
  const start = startOfWeek(currentDate);
  const end = endOfWeek(currentDate);

  const days = eachDayOfInterval({
    start,
    end,
  });



  return (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {format(start, 'MMM d', { locale: dateLocale })} - {format(end, 'MMM d, yyyy', { locale: dateLocale })}
        </h2>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 mb-2 gap-2 pr-4">
        {days.map((day) => (
          <div key={day.toString()} className="text-center">
            <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">{format(day, 'EEE', { locale: dateLocale })}</div>
            <div className={clsx(
              "text-sm font-bold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full",
              isToday(day) ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week Grid (Scrollable) */}
      <div ref={containerRef} className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="grid grid-cols-7 gap-2 min-h-full">
           {/* Days Columns */}
           {days.map((day) => (
             <DroppableWeekColumn key={day.toString()} day={day} tasks={tasks} />
           ))}
        </div>
      </div>
    </div>
  );
};

const DroppableWeekColumn = ({ day, tasks }: { day: Date, tasks: any[] }) => {
  const dateStr = format(day, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({
    id: `calendar:${dateStr}`,
    data: { type: 'calendar-day', date: dateStr },
  });

  const dayTasks = tasks.filter(t => t.dates?.includes(dateStr));

  return (
    <div 
      ref={setNodeRef}
      className={clsx(
        "col-span-1 relative border-l border-gray-100 dark:border-gray-800 flex flex-col min-h-full transition-colors",
        isOver && "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 inset-0 z-20"
      )}
    >
      
      {/* Tasks Container */}
      <div className="relative z-10 p-1 flex flex-col gap-1">
        {dayTasks.map((task: any) => (
          <div 
            key={task.id}
            className={clsx(
              "h-20 p-2 rounded-lg border shadow-sm cursor-pointer hover:shadow-md dark:hover:shadow-black/30 transition-all group flex flex-col justify-between",
              task.status === 'done' ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60" :
              "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <span className={clsx(
                "text-xs font-semibold line-clamp-2 leading-tight",
                task.status === 'done' ? "text-gray-500 dark:text-gray-500 line-through" : "text-gray-800 dark:text-gray-100"
              )}>
                {task.title}
              </span>
              {/* Priority Indicator */}
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1",
                task.priority === 'high' ? "bg-red-400" :
                task.priority === 'medium' ? "bg-orange-400" :
                "bg-blue-400"
              )} />
            </div>
            
            {/* Tags or Details */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {task.tags.slice(0, 2).map((tag: any) => (
                  <span key={tag} className="text-[9px] px-1 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
