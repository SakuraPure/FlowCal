import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { type Task } from '@/store/useStore';

interface DraggableWeekTaskProps {
  task: Task;
  variant?: 'default' | 'capsule';
}

export const DraggableWeekTask = ({ task, variant = 'default' }: DraggableWeekTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, type: 'week-task' },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  if (variant === 'capsule') {
      return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "rounded-full px-2 py-0.5 text-xs border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group flex items-center justify-center w-full max-w-full truncate touch-none",
                isDragging ? "opacity-50 z-50 ring-2 ring-blue-400" : "",
                task.status === 'done' 
                    ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 line-through text-gray-400" 
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
            )}
        >
            <div className={clsx(
                "w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0",
                task.priority === 'high' ? "bg-red-500" :
                task.priority === 'medium' ? "bg-orange-500" :
                "bg-blue-500"
            )} />
            <span className="truncate font-medium text-gray-700 dark:text-gray-200 leading-none">{task.title}</span>
        </div>
      );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "h-20 p-2 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all group flex flex-col justify-between touch-none",
        isDragging ? "opacity-50 z-50 ring-2 ring-blue-400 rotate-2" : "hover:shadow-md dark:hover:shadow-black/30",
        task.status === 'done' 
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60" 
          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
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
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {task.tags.slice(0, 2).map((tag: string) => (
            <span key={tag} className="text-[9px] px-1 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
