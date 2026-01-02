import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { type Task } from '@/store/useStore';

interface TimeGridTaskProps {
  task: Task;
  hourHeight: number;
  style?: React.CSSProperties; // Allow overriding style (width, left)
}

export const TimeGridTask = ({ task, hourHeight, style: propStyle }: TimeGridTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, type: 'time-task', originTime: task.time },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  // Calculate position
  const [hours, minutes] = (task.time || '00:00').split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  style.top = `${startMinutes * (hourHeight / 60)}px`;
  
  // Calculate height based on duration, default to 30 mins
  const duration = task.duration || 30;
  style.height = `${Math.max(24, duration * (hourHeight / 60))}px`; // Min height 24px

  // Merge propStyle
  Object.assign(style, propStyle);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "absolute left-1 right-1 rounded px-2 py-1 text-xs border-l-4 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden group transition-all z-10",
        isDragging ? "opacity-50 ring-2 ring-blue-400 z-50" : "hover:shadow-md hover:z-20",
        task.status === 'done' 
            ? "bg-gray-100 dark:bg-gray-800 border-gray-400 text-gray-500 line-through opacity-70"
            : task.priority === 'high' ? "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100"
            : task.priority === 'medium' ? "bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-900 dark:text-orange-100"
            : "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-100"
      )}
    >
      <div className="flex flex-col h-full">
        <span className="font-semibold truncate">{task.title}</span>
        {duration > 30 && (
           <span className="opacity-75 text-[10px]">{task.time}</span>
        )}
      </div>
    </div>
  );
};
