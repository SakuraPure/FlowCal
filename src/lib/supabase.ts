import { createClient } from "@supabase/supabase-js";
import type { Task, Folder, Session } from "../store/useStore";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Mappers ---

export function toSupabaseTask(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    status: task.status,
    dates: task.dates,
    parent_id: task.parentId,
    list_id: task.listId,
    start_date: task.startDate,
    due_date: task.dueDate,
    reminder: task.reminder,
    priority: task.priority,
    tags: task.tags,
    duration: task.duration,
    pomodoro: task.pomodoro,
    color_theme: task.colorTheme,
    // updated_at: new Date().toISOString() // handled by generic trigger or default?
    // better to send it if we track it.
  };
}

export function fromSupabaseTask(data: any): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    dates: data.dates,
    parentId: data.parent_id,
    listId: data.list_id,
    startDate: data.start_date,
    dueDate: data.due_date,
    reminder: data.reminder, // JSONB
    reminders: [], // deprecated
    priority: data.priority,
    tags: data.tags,
    subtasks: [], // deprecated
    duration: data.duration,
    pomodoro: data.pomodoro, // JSONB
    colorTheme: data.color_theme,
  };
}

export function toSupabaseFolder(folder: Folder, userId: string) {
  return {
    id: folder.id,
    user_id: userId,
    name: folder.name,
    parent_id: folder.parentId,
    color: folder.color,
    icon: folder.icon,
    is_expanded: folder.isExpanded,
  };
}

export function fromSupabaseFolder(data: any): Folder {
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id,
    color: data.color,
    icon: data.icon,
    isExpanded: data.is_expanded,
  };
}

export function toSupabaseSession(session: Session, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    task_id: session.taskId,
    start_time: session.startTime,
    end_time: session.endTime,
    duration: session.duration,
    type: session.type,
  };
}
