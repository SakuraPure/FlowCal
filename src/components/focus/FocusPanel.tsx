import clsx from 'clsx';
import { format, isSameDay } from 'date-fns';
import { useStore } from '@/store/useStore';
import { CheckCircle, Clock, Tag, Calendar, Timer, Play, Settings as SettingsIcon, CalendarOff } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

import { useState } from 'react';
import { TaskDetailForm } from '@/components/task/TaskDetailForm';
import { TimerDisplay } from './TimerDisplay';
import { PomodoroSettingsModal } from './PomodoroSettingsModal';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDateLocale } from '@/i18n/dateFns';

export const FocusPanel = () => {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { currentDate, tasks, updateTask, startTimer, removeFromDate } = useStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.dates?.includes(dateStr));
  const isToday = isSameDay(currentDate, new Date());

  const { isOver, setNodeRef } = useDroppable({
      id: 'focus-panel-drop-target', 
      data: { type: 'focus-panel', date: dateStr } // Acts as a drop target for current date
  });

  return (
    <div className={clsx(
      "relative h-full w-full",
      "bg-white dark:bg-gray-900", 
      "rounded-3xl",
      "shadow-xl shadow-gray-200/50 dark:shadow-black/50",
      "border border-gray-100 dark:border-gray-800",
      "flex flex-col overflow-hidden p-4"
    )}>
      <PomodoroSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <AnimatePresence>
        {useStore.getState().activeTimer && (
          <div className="absolute inset-0 z-50 p-4">
             <TimerDisplay />
          </div>
        )}
      </AnimatePresence>

      {selectedTaskId ? (
        // Detailed View
        <TaskDetailForm 
          taskId={selectedTaskId}
          onSave={() => setSelectedTaskId(null)}
          onDelete={() => setSelectedTaskId(null)}
          onCancel={() => setSelectedTaskId(null)}
          showBackButton={true}
          variant="panel"
          className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          onNavigate={(targetId) => setSelectedTaskId(targetId)}
        />
      ) : (
        // List View
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {format(currentDate, 'd')}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
                  {format(currentDate, 'EEEE', { locale: dateLocale })}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                  {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {dayTasks.length} {t('focus.tasks_suffix')}
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div 
            ref={setNodeRef}
            className={clsx(
              "flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-4 px-2 pb-2 no-scrollbar rounded-xl transition-colors",
              isOver && "bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-300 dark:border-blue-700"
            )}>
            {dayTasks.length > 0 ? (
              dayTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={clsx(
                    "flex-shrink-0 w-80 h-full bg-white/60 dark:bg-gray-800/80 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md dark:hover:shadow-black/50 transition-all p-4 flex flex-col gap-3 group relative cursor-pointer",
                    task.status === 'done' && "opacity-60 grayscale"
                  )}
                >
                  {/* Priority Strip */}
                  <div className={clsx(
                    "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
                    task.priority === 'high' ? "bg-red-400" :
                    task.priority === 'medium' ? "bg-orange-400" :
                    "bg-blue-400"
                  )} />

                  {/* Header */}
                  <div className="pl-3 flex justify-between items-start">
                    <h3 className={clsx(
                      "font-bold text-gray-800 dark:text-gray-100 line-clamp-2",
                      task.status === 'done' && "line-through text-gray-500 dark:text-gray-500"
                    )}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFromDate(task.id, dateStr);
                            }}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('task_detail.unschedule')}
                        >
                            <CalendarOff size={16} />
                        </button>
                        <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
                        }}
                        className={clsx(
                            "p-1 rounded-full transition-colors",
                            task.status === 'done' ? "text-green-600 bg-green-50 dark:bg-green-900/30" : "text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        )}
                        >
                        <CheckCircle size={18} className={task.status === 'done' ? "fill-current" : ""} />
                        </button>
                    </div>
                  </div>

                  {/* Meta Info Row */}
                  <div className="pl-3 flex flex-wrap gap-3 text-[10px] text-gray-500 font-medium">
                    {/* List/Folder */}
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="uppercase tracking-wider">
                        {useStore.getState().folders.find(f => f.id === task.listId)?.name === 'Inbox' ? t('inbox') : (useStore.getState().folders.find(f => f.id === task.listId)?.name || t('inbox'))}
                      </span>
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        <Clock size={10} />
                        <span>{format(new Date(task.dueDate), 'MMM d', { locale: dateLocale })}</span>
                      </div>
                    )}

                    {/* Duration */}
                    {task.duration && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        <span>{task.duration}m</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="pl-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Footer Info & Actions */}
                  <div className="pl-3 mt-auto flex flex-col gap-2">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between">
                       {/* Tags */}
                       <div className="flex flex-wrap gap-1">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md flex items-center gap-1">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>

                      {/* Pomodoro Dots */}
                      {task.pomodoro && (
                        <div className="flex gap-0.5">
                            {Array.from({ length: task.pomodoro.totalCycles }).map((_, i) => (
                              <div 
                                key={i} 
                                className={clsx(
                                  "w-2 h-2 rounded-full",
                                  i < task.pomodoro!.completedCycles ? "bg-red-400" : "bg-gray-200 dark:bg-gray-700"
                                )} 
                              />
                            ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons (Visible on Hover) - Only show if TODAY */}
                    {isToday && (
                    <div className="grid grid-cols-[1.2fr_1fr] gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
                        {/* Split Button: [Settings|Start Pomo] */}
                        <div className="flex items-stretch rounded-lg overflow-hidden bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group/split">
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSettingsOpen(true);
                                }}
                                className="px-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border-r border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center p-1.5"
                                title={t('focus.settings')}
                            >
                                <SettingsIcon size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startTimer(task.id, 'pomodoro');
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-xs font-bold"
                            >
                                <Timer size={14} />
                                <span>{t('focus.pomo')}</span>
                            </button>
                        </div>

                        <div className="flex gap-2">
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startTimer(task.id, 'stopwatch');
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs font-bold"
                            >
                                <Play size={14} />
                                {t('focus.start')}
                            </button>
                        </div>
                    </div>
                )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Calendar size={32} className="opacity-20" />
                <p className="text-sm font-medium">{t('tasks.no_events')}</p>
                <p className="text-xs opacity-60">{t('calendar.drag_to_schedule')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
