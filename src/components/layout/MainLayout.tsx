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
      } else {
        // Dropped on a day (Calendar)
        const dateStr = overId;
        const { assignToDate } = useStore.getState();
        assignToDate(activeId, dateStr);
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
