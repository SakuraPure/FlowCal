import clsx from 'clsx';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '@/store/useStore';
import { useScrollZoom } from '@/hooks/useScrollZoom';
import { useRef } from 'react';
import { useDateLocale } from '@/i18n/dateFns';
import { DraggableWeekTask } from './DraggableWeekTask'; // For all-day tasks
import { TimeGridTask } from './TimeGridTask'; // For timed tasks

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

  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Dynamic Layout Algorithm
  // 1. Calculate Lane Indices for each day
  const dayLanes = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.dates?.includes(dateStr) && t.time);
      
      // Sort tasks
      const sorted = [...dayTasks].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      const lanes: any[] = []; // Array of end times (in minutes) for each lane
      const taskLanes = new Map<string, number>();

      sorted.forEach(task => {
          const [h, m] = (task.time || '00:00').split(':').map(Number);
          const start = h * 60 + m;
          const duration = task.duration || 30; // Default duration
          
          let laneIndex = -1;
          for (let i = 0; i < lanes.length; i++) {
              if (lanes[i] <= start) {
                  laneIndex = i;
                  break;
              }
          }
          if (laneIndex === -1) {
              laneIndex = lanes.length;
              lanes.push(0);
          }
          
          lanes[laneIndex] = start + duration; // Update lane free time
          taskLanes.set(task.id, laneIndex);
      });
      return { day, taskLanes, tasks: dayTasks };
  });

  // 2. Calculate Slot Heights (global synchronization)
  // We use 30-minute slots (0..47)
  const BASE_SLOT_HEIGHT = 40; // Minimum height for 30 mins
  const LANE_HEIGHT = 42; // Height per overlapping task (slightly more than BASE for spacing)
  
  const slotHeights = new Array(48).fill(BASE_SLOT_HEIGHT);
  
  for (let s = 0; s < 48; s++) {
      let maxLanesInSlot = 0;
      const slotStart = s * 30;
      const slotEnd = slotStart + 30;

      dayLanes.forEach(({ tasks, taskLanes }) => {
          tasks.forEach(task => {
              const [h, m] = (task.time || '00:00').split(':').map(Number);
              const start = h * 60 + m;
              const duration = task.duration || 30;
              const end = start + duration;
              
              // If task intersects this slot
              if (Math.max(start, slotStart) < Math.min(end, slotEnd)) {
                  const lane = taskLanes.get(task.id) ?? 0;
                  // If we have tasks at lane N, we need N+1 height capacity? 
                  // Actually, if we have tasks stacked up to Lane 2, we need 3 * LANE_HEIGHT?
                  // Wait, we need to know how many tasks are *concurrently* in this slot
                  // But 'lanes' logic already compacted them.
                  // Just take the max lane index active in this slot.
                  if (lane >= maxLanesInSlot) maxLanesInSlot = lane + 1; // +1 because 0-indexed
              }
          });
      });
      
      // If busy, expand height
      if (maxLanesInSlot > 0) {
          slotHeights[s] = Math.max(BASE_SLOT_HEIGHT, maxLanesInSlot * LANE_HEIGHT);
      }
  }

  // 3. Calculate Cumulative Y Positions
  const slotTops = [0];
  for (let s = 0; s < 48; s++) {
      slotTops.push(slotTops[s] + slotHeights[s]);
  }
  const totalHeight = slotTops[48];

  const getY = (minutes: number) => {
      const slot = Math.floor(minutes / 30);
      const remainder = minutes % 30;
      if (slot >= 48) return totalHeight;
      const slotHeight = slotHeights[slot];
      return slotTops[slot] + (remainder / 30) * slotHeight;
  };

  return (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {format(start, 'MMM d', { locale: dateLocale })} - {format(end, 'MMM d, yyyy', { locale: dateLocale })}
        </h2>
      </div>

      {/* Week Header & All Day Section */}
      <div className="flex flex-col flex-shrink-0 pl-20 pr-4 mb-2"> {/* Offset for time labels */}
        <div className="grid grid-cols-7 gap-px border-b border-gray-200 dark:border-gray-800 pb-2">
            {days.map((day) => (
                <div key={day.toString()} className="text-center">
                    <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">{format(day, 'EEE', { locale: dateLocale })}</div>
                    <div className={clsx(
                    "text-sm font-bold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                    isToday(day) ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                    {format(day, 'd')}
                    </div>
                    {/* All Day Tasks Area */}
                    <div className="mt-2 min-h-[2rem] space-y-1">
                        <DroppableAllDayColumn day={day} tasks={tasks} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Scrollable Time Grid */}
      <div ref={containerRef} className="flex-1 overflow-y-auto no-scrollbar relative">
         <div className="relative min-w-full flex py-4" style={{ height: totalHeight + 32 }}> 
            {/* Time Labels (Left Sidebar) */}
            <div className="w-20 flex-shrink-0 bg-white dark:bg-gray-950/50 z-20 pointer-events-none sticky left-0 border-r border-gray-100 dark:border-gray-800">
                {hours.map((hour) => (
                    <div key={hour} className="absolute right-2 text-xs text-gray-400 dark:text-gray-600 transform -translate-y-1/2 whitespace-nowrap" style={{ top: getY(hour * 60) }}>
                        {format(new Date().setHours(hour, 0), 'p', { locale: dateLocale })}
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-7 h-full relative mr-4">
                 {/* Horizontal Lines */}
                {hours.map((hour) => (
                    <div key={`line-${hour}`} className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800 pointer-events-none w-full" style={{ top: getY(hour * 60) }} />
                ))}

                {/* Day Columns */}
                {days.map((day, dIndex) => (
                    <DroppableTimeColumn 
                        key={day.toString()} 
                        day={day} 
                        tasks={dayLanes[dIndex].tasks} // Pass pre-filtered tasks
                        taskLanes={dayLanes[dIndex].taskLanes} // Pass pre-calculated lanes
                        slotHeights={slotHeights} // Pass layout info
                        slotTops={slotTops}
                        getY={getY}
                    />
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

// Column for "All Day" tasks (tasks without specific time)
const DroppableAllDayColumn = ({ day, tasks }: { day: Date, tasks: any[] }) => {
  const dateStr = format(day, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({
    id: `calendar:${dateStr}:allday`,
    data: { type: 'calendar-day', date: dateStr, isAllDay: true },
  });

  const dayTasks = tasks.filter(t => t.dates?.includes(dateStr) && !t.time);

  return (
    <div 
      ref={setNodeRef}
      className={clsx(
        "min-h-[2rem] p-1 rounded transition-colors grid grid-cols-2 gap-1 content-start", // Grid layout
        isOver && "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200"
      )}
    >
      {dayTasks.map((task: any) => (
         <div key={task.id} className="w-full overflow-hidden"> 
             <DraggableWeekTask task={task} variant="capsule" />
         </div>
      ))}
    </div>
  );
};


const DroppableTimeColumn = ({ day, tasks, taskLanes, slotHeights, slotTops, getY }: { 
    day: Date, 
    tasks: any[], 
    taskLanes: Map<string, number>,
    slotHeights: number[],
    slotTops: number[],
    getY: (m: number) => number
}) => {
    const dateStr = format(day, 'yyyy-MM-dd');
  
    // Create 30-minute slots for droppable bg
    const slots = [];
    for (let s = 0; s < 48; s++) {
        const h = Math.floor(s / 2);
        const m = (s % 2) * 30;
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        slots.push({ time, y: slotTops[s], height: slotHeights[s] });
    }

    const tasksWithStyle = tasks.map((task: any) => {
        const [h, m] = (task.time || '00:00').split(':').map(Number);
        const startMinutes = h * 60 + m;
        const duration = task.duration || 30;
        const endMinutes = startMinutes + duration;
        
        const top = getY(startMinutes);
        const bottom = getY(endMinutes);
        const height = bottom - top;
        
        // Lane adjustment: if we are in a lane > 0, we can just flow? 
        // With 'expand to fit', the grid expansion already ensures there is vertical space.
        // We just need to ensure the task renders at the right vertical pos.
        // Wait, if grid expanded, 'top' is correct.
        // But if multiple tasks share the slot, do they just sit on top of each other?
        // NO, we need to offset them by Lane!
        
        const lane = taskLanes.get(task.id) || 0;
        // The slot height was expanded to (MaxLanes * LaneHeight).
        // But getY() returns the top of the SLOT (or proportional).
        // If we are in Lane 1, we should be LaneHeight pixels below Lane 0?
        // YES. But 'getY' returns the linear interpolation.
        
        // This is tricky. If we use getY(start), and the slot is giant.
        // Task A (Lane 0) and Task B (Lane 1) both start at 4:00.
        // getY(240) returns SlotTop.
        // So both render at SlotTop. They overlap!
        
        // We need to ADD the lane offset manually.
        const laneOffset = lane * 42; // Lane Height
        
        // But what if the task spans multiple slots?
        // The offset applies to the start.
        
        return { 
            ...task, 
            style: { 
                top: `${top + laneOffset}px`, 
                height: `38px`, // Capsule height
                width: '95%',
                zIndex: 10 + lane,
                left: '2.5%'
            } 
        };
    });

    return (
      <div className="relative border-l border-gray-100 dark:border-gray-800 h-full transition-colors">
        
        {/* Background Slots for Dropping */}
        <div className="absolute inset-0 z-0 flex flex-col">
            {slots.map((slot) => (
                <DroppableTimeSlot key={slot.time} date={dateStr} time={slot.time} height={slot.height} />
            ))}
        </div>

        {/* Tasks Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none"> 
             {tasksWithStyle.map((task: any) => (
                <div key={task.id} className="pointer-events-auto">
                    <TimeGridTask task={task} hourHeight={0} style={task.style} /> {/* hourHeight irrelevant if style overrides */}
                </div>
            ))}
        </div>
      </div>
    );
};


const DroppableTimeSlot = ({ date, time, height }: { date: string, time: string, height: number }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `calendar:${date}:${time}`,
        data: { type: 'time-slot', date, time },
    });

    return (
        <div 
            ref={setNodeRef} 
            className={clsx(
                "w-full box-border border-gray-50 dark:border-gray-800/20",
                isOver ? "bg-blue-100/50 dark:bg-blue-900/40" : "transparent"
            )}
            style={{ height }} // e.g. 40px
        />
    );
};
