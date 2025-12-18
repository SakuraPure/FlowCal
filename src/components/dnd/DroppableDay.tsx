import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import { format } from 'date-fns';

interface DroppableDayProps {
  date: Date;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DroppableDay = ({ date, children, className, onClick }: DroppableDayProps) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({
    id: dateStr,
    data: { date: dateStr },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        className,
        isOver && "ring-2 ring-blue-400 bg-blue-50/50"
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
