import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { type Task } from '@/store/useStore';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DraggableTaskProps {
  task: Task;
}

export const DraggableTask = ({ task }: DraggableTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-2 cursor-grab active:cursor-grabbing transition-shadow group relative overflow-hidden",
        isDragging ? "opacity-50" : "hover:shadow-md dark:hover:shadow-black/30"
      )}
    >
      {/* Priority Indicator Strip */}
      <div className={clsx("absolute left-0 top-0 bottom-0 w-1", 
        task.priority === 'high' ? "bg-red-400" : 
        task.priority === 'medium' ? "bg-orange-400" : "bg-blue-400"
      )} />

      <div className="pl-2">
        <div className="flex justify-between items-start">
          <h4 className={clsx(
            "text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
            task.status === 'done' && "line-through text-gray-400 dark:text-gray-600"
          )}>
            {task.title}
          </h4>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
              <Calendar size={10} />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          )}
          
          {task.tags?.map(tag => (
            <span key={tag} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
