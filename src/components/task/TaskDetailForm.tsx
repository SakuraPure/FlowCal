import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { useStore, type Task } from '@/store/useStore';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { X, Trash2, Clock, CheckCircle2, Circle, Calendar, Flag, Tag, Plus, CheckSquare, Square, ChevronDown, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TaskDetailFormProps {
  taskId: string;
  onSave: () => void;
  onDelete: () => void;
  onCancel?: () => void;
  className?: string;
  showBackButton?: boolean;
  variant?: 'modal' | 'panel';
  onNavigate?: (taskId: string) => void;
}

const SubtasksSection = ({ 
    task, 
    tasks, 
    updateTask, 
    onNavigate 
}: { 
    task: Task; 
    tasks: Task[]; 
    updateTask: (id: string, data: Partial<Task>) => void; 
    onNavigate?: (id: string) => void; 
}) => {
    const { t } = useTranslation();
    // Parent Link
    const parentTask = task.parentId ? tasks.find(t => t.id === task.parentId) : null;
    
    // Child Tasks
    const childTasks = tasks.filter(t => t.parentId === task.id);
    
    // Local State
    const [isLinking, setIsLinking] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const handleAddSubtask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSubtaskTitle.trim()) return;
      
      const newSubtask: Task = {
          id: uuidv4(),
          title: newSubtaskTitle,
          status: 'todo',
          parentId: task.id,
          listId: task.listId, // Inherit list
          priority: 'medium',
          tags: [],
          subtasks: [],
          dates: [], // Optional: Inherit date?
      };
      
      useStore.getState().addTask(newSubtask);
      setNewSubtaskTitle('');
    };

    const handleLinkTask = (childId: string) => {
       updateTask(childId, { parentId: task.id });
       setIsLinking(false);
    };

    const handleUnlinkTask = (childId: string) => {
       updateTask(childId, { parentId: null });
    };

    return (
      <div className="flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-100 p-3 overflow-hidden">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
            <span>{t('task_detail.subtasks_related')}</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 rounded-full">{childTasks.length}</span>
        </label>
        
        {/* Parent Link */}
        {parentTask && (
            <div 
                onClick={() => onNavigate?.(parentTask.id)}
                className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition-colors"
                title="Go to Parent Task"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <ArrowLeft size={14} className="text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-blue-700 truncate font-medium">
                        {t('task_detail.parent')}: <span className="underline decoration-blue-300">{parentTask.title}</span>
                    </span>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
          {childTasks.map(st => (
            <div key={st.id} className="group flex items-center gap-2 text-sm p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-blue-300 transition-colors">
              <button 
                onClick={() => updateTask(st.id, { status: st.status === 'done' ? 'todo' : 'done' })}
                className={clsx(
                  "flex-shrink-0 text-gray-400 hover:text-green-500 transition-colors",
                  st.status === 'done' && "text-green-500"
                )}
              >
                {st.status === 'done' ? <CheckSquare size={16} /> : <Square size={16} />}
              </button>
              <div className={clsx(
                  "flex-1 truncate select-none",
                  st.status === 'done' && "line-through text-gray-400"
              )}>
                  {st.title}
              </div>
              <button 
                onClick={() => handleUnlinkTask(st.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1"
                title="Unlink"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          {childTasks.length === 0 && !parentTask && (
              <div className="text-center py-4 text-xs text-gray-400 italic">
                  {t('task_detail.no_subtasks')}
              </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {/* Add New */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                <Plus size={16} className="text-gray-400" />
                <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder={t('task_detail.new_subtask_placeholder')}
                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 placeholder-gray-400"
                />
            </form>

            {/* Link Existing */}
            <div className="relative">
                 {!isLinking ? (
                     <button 
                        type="button"
                        onClick={() => setIsLinking(true)}
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"
                     >
                         <Plus size={10} /> Link Existing Task
                     </button>
                 ) : (
                     <div className="absolute bottom-0 left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-lg p-1 z-10 max-h-40 overflow-y-auto">
                         <div className="flex justify-between items-center px-2 py-1 border-b border-gray-50 mb-1">
                             <span className="text-[10px] font-bold text-gray-500">Select Task</span>
                             <button onClick={() => setIsLinking(false)}><X size={12} className="text-gray-400"/></button>
                         </div>
                         {tasks
                            .filter(t => t.id !== task.id && t.parentId !== task.id && t.id !== task.parentId)
                            .map(t => (
                             <button
                                key={t.id}
                                onClick={() => handleLinkTask(t.id)}
                                className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded truncate"
                             >
                                 {t.title}
                             </button>
                         ))}
                         {tasks
                            .filter(t => t.id !== task.id && t.parentId !== task.id && t.id !== task.parentId)
                            .length === 0 && (
                             <div className="px-2 py-1 text-[10px] text-gray-400">No available tasks</div>
                         )}
                     </div>
                 )}
            </div>
        </div>
      </div>
    );
};

const TagsSection = ({ tags, onChange }: { tags: string[], onChange: (tags: string[]) => void }) => {
    const { t } = useTranslation();
    const [newTag, setNewTag] = useState('');

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!tags.includes(newTag.trim())) {
                onChange([...tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{t('task_detail.tags')}</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-blue-800"><X size={12} /></button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
              <Tag size={12} className="text-gray-400" />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={addTag}
                placeholder={t('task_detail.add_tag_placeholder')}
                className="bg-transparent border-none text-xs focus:ring-0 p-0 w-16 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
    );
};

export const TaskDetailForm = ({ 
  taskId, 
  onSave, 
  onDelete, 
  onCancel, 
  className, 
  showBackButton,
  variant = 'modal',
  onNavigate
}: TaskDetailFormProps) => {
  const { t } = useTranslation();
  const { tasks, folders, updateTask, deleteTask } = useStore();
  const task = tasks.find((t) => t.id === taskId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [listId, setListId] = useState<string>('inbox');
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  // subtasks state removed (handled by derived props in SubtasksSection)

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setDuration(task.duration);
      setPriority(task.priority);
      setListId(task.listId);
      setDueDate(task.dueDate || '');
      setTags(task.tags || []);
      // setSubtasks(task.subtasks || []); // Removed
    }
  }, [task]);

  const handleSave = () => {
    if (taskId) {
      updateTask(taskId, {
        title,
        description,
        status,
        duration,
        priority,
        listId,
        dueDate: dueDate || undefined,
        tags,
        // subtasks removed
      });
    }
    onSave();
  };

  const handleDelete = () => {
    if (taskId) {
      deleteTask(taskId);
    }
    onDelete();
  };

  if (!task) return null;

  // --- Shared Components ---

  const StatusDropdown = () => (
    <Listbox value={status} onChange={(val) => setStatus(val as Task['status'])}>
      <div className="relative">
        <Listbox.Button className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1",
          status === 'done' ? "bg-green-50 text-green-700 border-green-200 focus:ring-green-500" :
          status === 'in_progress' ? "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500" :
          "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 focus:ring-gray-500"
        )}>
          {status === 'done' ? <CheckCircle2 size={14} /> : 
           status === 'in_progress' ? <Clock size={14} /> : 
           <Circle size={14} />}
          <span className="capitalize">{status === 'in_progress' ? 'In Progress' : status === 'done' ? 'Completed' : 'To Do'}</span>
          <ChevronDown size={12} className={clsx(
            "ml-1",
            status === 'done' ? "text-green-500" : 
            status === 'in_progress' ? "text-blue-500" : 
            "text-gray-400"
          )} />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-36 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {[
              { value: 'todo', label: t('task_detail.status_todo'), icon: Circle, color: 'text-gray-500' },
              { value: 'in_progress', label: t('task_detail.status_in_progress'), icon: Clock, color: 'text-blue-500' },
              { value: 'done', label: t('task_detail.status_done'), icon: CheckCircle2, color: 'text-green-500' }
            ].map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  clsx(
                    "relative cursor-pointer select-none py-2 pl-10 pr-4",
                    active ? "bg-gray-50 text-gray-900" : "text-gray-900"
                  )
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span className={clsx("block truncate", selected ? "font-medium" : "font-normal")}>
                      {option.label}
                    </span>
                    <span className={clsx("absolute inset-y-0 left-0 flex items-center pl-3", option.color)}>
                      <option.icon size={14} />
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );

  const PriorityDropdown = () => (
    <Listbox value={priority} onChange={setPriority}>
      <div className="relative">
        <Listbox.Button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all">
          <Flag size={14} className={clsx(
            priority === 'high' ? "text-red-500" : priority === 'medium' ? "text-orange-500" : "text-blue-500"
          )} />
          <span className="capitalize">{t(`task_detail.priority_${priority as string}`)}</span>
          <ChevronDown size={12} className="text-gray-400" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-32 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {['low', 'medium', 'high'].map((p) => (
              <Listbox.Option
                key={p}
                className={({ active }) =>
                  clsx(
                    "relative cursor-pointer select-none py-2 pl-10 pr-4",
                    active ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  )
                }
                value={p}
              >
                {({ selected }) => (
                  <>
                    <span className={clsx("block truncate capitalize", selected ? "font-medium" : "font-normal")}>
                      {t(`task_detail.priority_${p}`)}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckCircle2 size={12} />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );

  const ListDropdown = () => (
    <Listbox value={listId} onChange={setListId}>
      <div className="relative">
        <Listbox.Button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all max-w-[150px]">
          <span className="truncate block">{folders.find(f => f.id === listId)?.name === 'Inbox' ? t('inbox') : folders.find(f => f.id === listId)?.name || t('inbox')}</span>
          <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-40 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {folders.map((f) => (
              <Listbox.Option
                key={f.id}
                className={({ active }) =>
                  clsx(
                    "relative cursor-pointer select-none py-2 pl-10 pr-4",
                    active ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  )
                }
                value={f.id}
              >
                {({ selected }) => (
                  <>
                    <span className={clsx("block truncate", selected ? "font-medium" : "font-normal")}>
                      {f.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckCircle2 size={12} />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );



  const AssignedDatesSection = () => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
        <Calendar size={12} />
        <span>{t('task_detail.assigned_dates')}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {task.dates && task.dates.length > 0 ? (
          task.dates.map(date => (
            <div key={date} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
              <span>{date}</span>
              <button 
                onClick={() => {
                  const { removeFromDate } = useStore.getState();
                  removeFromDate(task.id, date);
                }}
                className="hover:text-blue-900"
              >
                <X size={12} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-400 italic">{t('task_detail.no_dates')}</div>
        )}
      </div>
    </div>
  );

  // --- Layouts ---

  if (variant === 'panel') {
    return (
      <div className={clsx("flex flex-col h-full overflow-hidden", className)}>
        {/* Header: Title & Main Actions */}
        <div className="flex items-center justify-between gap-4 mb-3 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            {showBackButton && onCancel && (
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-300 bg-transparent"
              placeholder={t('task_detail.title_placeholder')}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title={t('task_detail.delete_task')}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              {t('common.save')}
            </button>
          </div>
        </div>

        {/* 3-Column Grid Content */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* Column 1: Properties (41.6% -> 5 cols) */}
          <div className="col-span-5 flex flex-col gap-2 border-r border-gray-100 pr-4 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-3 gap-3">
              {/* Sub-col 1: Status & Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('task_detail.status')}</label>
                <div className="flex flex-col gap-1.5">
                  <StatusDropdown />
                  <PriorityDropdown />
                </div>
              </div>

              {/* Sub-col 2: List */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('task_detail.list')}</label>
                <ListDropdown />
              </div>


            </div>

            {/* Focus Actions - REMOVED per user request to move to Card */}
            
            <div className="pt-2 border-t border-gray-50">
              <AssignedDatesSection />
            </div>
          </div>

          {/* Column 2: Description (25% -> 3 cols) */}
          <div className="col-span-3 flex flex-col min-h-0">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('task_detail.description')}</label>
             <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 w-full rounded-xl border-gray-200 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 resize-none p-3 leading-relaxed"
              placeholder={t('task_detail.description_placeholder')}
            />
          </div>

            {/* Column 3: Subtasks & Tags (33.3% -> 4 cols) */}
          <div className="col-span-4 flex flex-col gap-4 min-h-0 pl-2">
            <div className="flex-1 flex flex-col min-h-0">
              <SubtasksSection 
                task={task} 
                tasks={tasks} 
                updateTask={updateTask} 
                onNavigate={onNavigate} 
              />
            </div>
            <div className="flex-shrink-0 pt-2 border-t border-gray-50">
              <TagsSection tags={tags} onChange={setTags} />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Default Modal Layout
  return (
    <div className={clsx("flex flex-col h-full", className)}>
      {/* Header: Title & Controls */}
      <div className="flex justify-between items-start mb-4 gap-4">
        {showBackButton && onCancel && (
          <button onClick={onCancel} className="mt-1 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-300 bg-transparent"
            placeholder={t('task_detail.title_placeholder')}
          />
        </div>
        {!showBackButton && onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {/* Meta Row: Status, Priority, List */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatusDropdown />
          <PriorityDropdown />
          <ListDropdown />
        </div>

        {/* Body Content */}
        <div className="space-y-5">
          
          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-gray-200 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 resize-none"
              placeholder={t('task_detail.description_placeholder')}
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">{t('task_detail.due_date')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 rounded-xl border-gray-200 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">{t('task_detail.duration')}</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  value={duration || ''}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full pl-9 rounded-xl border-gray-200 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          <AssignedDatesSection />
          <SubtasksSection 
            task={task} 
            tasks={tasks} 
            updateTask={updateTask} 
            onNavigate={onNavigate}
           />
          <TagsSection tags={tags} onChange={setTags} />

        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-50">
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <Trash2 size={16} />
          {t('common.delete')}
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          {t('common.save_changes')}
        </button>
      </div>
    </div>
  );
};
