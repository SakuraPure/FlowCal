import { DndContext, type DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, type DragStartEvent } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPane } from './CalendarPane';
import { InboxPane } from './InboxPane';
import { FocusPanel } from '@/components/focus/FocusPanel';
import { useStore } from '@/store/useStore';
import { DraggableTask } from '@/components/dnd/DraggableTask';

export const MainLayout = () => {
  const { tasks, theme } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = tasks.find(t => t.id === activeId);

  // Theme Synchronization
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const applyTheme = (t: string) => {
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
         root.classList.remove('light', 'dark');
         applyTheme('system');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // DEBUG:
    console.log('[Theme Debug] Current Theme State:', theme);
    console.log('[Theme Debug] Root Classes:', root.classList.toString());
  }, [theme]);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;
      const overData = over.data.current;

      if (overData?.type === 'folder') {
        // Dropped on a folder
        const folderId = overData.folderId;
        const { updateTask } = useStore.getState();

        if (folderId === 'in_progress') {
          updateTask(activeId, { status: 'in_progress' });
        } else if (folderId === 'done') {
          updateTask(activeId, { status: 'done' });
        } else if (folderId === 'inbox') {
           updateTask(activeId, { listId: 'inbox', status: 'todo' });
        } else {
          updateTask(activeId, { listId: folderId });
        }
      } else if (overData?.type === 'calendar-day' || (typeof overId === 'string' && overId.startsWith('calendar:'))) {
        // Dropped on a day (Calendar)
        // overData should be robust: { type: 'time-slot', date: '...', time: '...' } OR { type: 'calendar-day', date: '...' }
        const { updateTask, assignToDate } = useStore.getState();

        if (overData?.type === 'time-slot') {
             // Dropped on a specific time slot (Week View)
             const dateStr = overData.date;
             const timeStr = overData.time;
             if (dateStr && timeStr) {
                 updateTask(activeId, { dates: [dateStr], time: timeStr });
             }
        } else if (overData?.type === 'calendar-day' && overData.isAllDay) {
             // Dropped on All Day section (Week View)
             const dateStr = overData.date;
             if (dateStr) {
                updateTask(activeId, { dates: [dateStr], time: undefined });
             }
        } else {
             // Fallback ID parsing (Month View or generic day drop)
             const parts = overId.toString().split(':');
             // calendar:YYYY-MM-DD:...
             const dateStr = overData?.date || parts[1];
             
             // If we have an explicit date, assign to it. 
             // Behavior: Use assignToDate to ADD/Ensure date (Month view logic)
             // But if we are in Week view context (inferred from parts?), maybe we want single-date assignment?
             // Sticking to existing logic: assignToDate for generic days.
             if (dateStr) {
                assignToDate(activeId, dateStr);
             }
        }
      } else if (overData?.type === 'focus-panel' || overId === 'focus-panel-drop-target') {
        // Dropped on Focus Panel (Schedule for Today/Current View)
        const dateStr = overData?.date;
        if (dateStr) {
           const { assignToDate } = useStore.getState();
           assignToDate(activeId, dateStr);
        }
      } else {
        // Fallback for raw date IDs (if any remain) - Legacy support
         if (typeof overId === 'string' && overId.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const { assignToDate } = useStore.getState();
            assignToDate(activeId, overId);
         }
      }
    }
    
    setActiveId(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen w-screen bg-gray-50 dark:bg-gray-950 p-6 overflow-hidden transition-colors duration-300">
        <div className="grid grid-cols-12 grid-rows-12 gap-6 h-full w-full max-w-[1600px] mx-auto">
          
          {/* Main Calendar Area (Top-Left) */}
          <div className="col-span-9 row-span-9 relative z-10">
            <CalendarPane />
          </div>

          {/* Inbox Area (Right) */}
          <div className="col-span-3 row-span-9 relative z-10">
            <InboxPane />
          </div>

          {/* Bottom Panel (Full Width) */}
          <div className="col-span-12 row-span-3 relative z-20">
            <FocusPanel />
          </div>

        </div>
      </div>
      
      {createPortal(
        <DragOverlay>
          {activeTask ? <DraggableTask task={activeTask} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
