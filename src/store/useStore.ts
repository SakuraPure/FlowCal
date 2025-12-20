import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "month" | "week" | "day";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  isExpanded?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  dates?: string[]; // ISO Date Strings YYYY-MM-DD

  // Hierarchy
  parentId?: string | null; // Reference to another Task.id

  // Advanced Fields
  listId: string; // Reference to Folder.id
  startDate?: string;
  dueDate?: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
    // We could add 'type' if we want email/push later
  };
  reminders?: string[]; // @deprecated - migrating to single reminder object for now, or keep array if multiple needed. keeping simplistic as per request.
  priority: "low" | "medium" | "high";
  tags: string[];
  subtasks: Subtask[]; // @deprecated - migrating to parentId relationship

  duration?: number; // Minutes
  pomodoro?: {
    totalCycles: number;
    completedCycles: number;
  };
  colorTheme?: string;
}

export type Theme = "light" | "dark" | "system";

interface AppState {
  viewMode: ViewMode;
  currentDate: Date;
  theme: Theme;

  tasks: Task[];
  folders: Folder[];
  currentFolderId: string; // For filtering the inbox view

  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  setTheme: (theme: Theme) => void;
  setCurrentFolderId: (folderId: string) => void;

  // Task Actions
  assignToDate: (taskId: string, date: string) => void;
  removeFromDate: (taskId: string, date: string) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // Folder Actions
  addFolder: (folder: Folder) => void;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  deleteFolder: (folderId: string) => void;

  // Timer Actions
  activeTimer: ActiveTimer | null;
  pomodoroSettings: PomodoroSettings;
  dailyActivity: Record<string, number>; // YYYY-MM-DD -> Minutes
  sessions: Session[];
  setPomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  startTimer: (taskId: string, type: "pomodoro" | "stopwatch") => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
}

export interface Session {
  id: string;
  taskId: string;
  startTime: number;
  endTime: number;
  duration: number; // Minutes
  type: "pomodoro" | "stopwatch";
}

export interface ActiveTimer {
  taskId: string;
  type: "pomodoro" | "stopwatch";
  startTime: number;
  duration: number; // Minutes (Target for Pomo)
  elapsed: number; // Seconds (Current phase)
  status: "running" | "paused";
  phase: "work" | "short_break" | "long_break";
  cyclesCompleted: number;
}

export const useStore = create<AppState>()(
  persist<AppState>(
    (set: any) => ({
      viewMode: "month",
      currentDate: new Date(),
      theme: "system",
      currentFolderId: "inbox",
      dailyActivity: {} as Record<string, number>, // Init
      sessions: [] as Session[], // Init

      folders: [
        { id: "inbox", name: "Inbox", parentId: null, icon: "inbox" },
      ] as Folder[],

      tasks: [
        // ... (unchanged)
        {
          id: "1",
          title: "Design System",
          status: "todo",
          listId: "work",
          priority: "high",
          tags: ["design"],
          subtasks: [],
          dates: [],
        },
        {
          id: "2",
          title: "Buy Groceries",
          status: "todo",
          listId: "personal",
          priority: "medium",
          tags: [],
          subtasks: [],
          dates: [],
        },
      ] as Task[],

      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setTheme: (theme) => set({ theme }),
      setCurrentFolderId: (id) => set({ currentFolderId: id }),

      assignToDate: (taskId, date) =>
        set((state: AppState) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const currentDates = t.dates || [];
            if (currentDates.includes(date)) return t; // Already assigned
            return { ...t, dates: [...currentDates, date] };
          }),
        })),

      removeFromDate: (taskId, date) =>
        set((state: AppState) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, dates: (t.dates || []).filter((d) => d !== date) }
              : t
          ),
        })),

      activeTimer: null as ActiveTimer | null,
      pomodoroSettings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        cyclesBeforeLongBreak: 4,
      },

      setPomodoroSettings: (settings) =>
        set({
          pomodoroSettings: {
            ...useStore.getState().pomodoroSettings,
            ...settings,
          },
        }),

      startTimer: (taskId, type) => {
        const state = useStore.getState();
        const duration =
          type === "pomodoro" ? state.pomodoroSettings.workDuration : 0;

        set({
          activeTimer: {
            taskId,
            type,
            startTime: Date.now(),
            duration,
            elapsed: 0,
            status: "running",
            phase: "work",
            cyclesCompleted: 0,
          },
        });
      },

      pauseTimer: () =>
        set((state: AppState) => {
          if (!state.activeTimer) return {};

          // Persist progress to task & dailyActivity
          const task = state.tasks.find(
            (t) => t.id === state.activeTimer!.taskId
          );
          let updatedTasks = state.tasks;
          let updatedDailyActivity = { ...state.dailyActivity };

          if (task) {
            // Only persist duration for "work" phase or stopwatch
            if (
              state.activeTimer!.type === "stopwatch" ||
              state.activeTimer!.phase === "work"
            ) {
              const addedMinutes = state.activeTimer!.elapsed / 60;

              // Update Task Duration
              updatedTasks = state.tasks.map((t) =>
                t.id === task.id
                  ? { ...t, duration: (t.duration || 0) + addedMinutes }
                  : t
              );

              // Update Daily Activity
              const today = new Date().toISOString().split("T")[0];
              updatedDailyActivity[today] =
                (updatedDailyActivity[today] || 0) + addedMinutes;
            }
          }

          return {
            tasks: updatedTasks,
            dailyActivity: updatedDailyActivity,
            activeTimer: {
              ...state.activeTimer,
              status:
                state.activeTimer.status === "running" ? "paused" : "running",
            },
          };
        }),

      stopTimer: () =>
        set((state: AppState) => {
          if (!state.activeTimer) return {};

          const task = state.tasks.find(
            (t) => t.id === state.activeTimer!.taskId
          );
          let updatedTasks = state.tasks;
          let updatedDailyActivity = { ...state.dailyActivity };
          let updatedSessions = state.sessions;

          if (task) {
            if (
              state.activeTimer!.type === "stopwatch" ||
              state.activeTimer!.phase === "work"
            ) {
              const addedMinutes = state.activeTimer!.elapsed / 60; // Calculate minutes

              updatedTasks = state.tasks.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      duration: Math.floor((t.duration || 0) + addedMinutes),
                    }
                  : t
              );

              const today = new Date().toISOString().split("T")[0];
              updatedDailyActivity[today] =
                (updatedDailyActivity[today] || 0) + addedMinutes;

              // Record Session
              if (addedMinutes > 0.1) {
                // Only log significant sessions (>6 seconds)
                updatedSessions = [
                  ...state.sessions,
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    taskId: task.id,
                    startTime: state.activeTimer!.startTime,
                    endTime: Date.now(),
                    duration: addedMinutes,
                    type: state.activeTimer!.type,
                  },
                ];
              }
            }
          }

          return {
            activeTimer: null,
            tasks: updatedTasks,
            dailyActivity: updatedDailyActivity,
            sessions: updatedSessions,
          };
        }),

      tickTimer: () =>
        set((state: AppState) => {
          if (!state.activeTimer || state.activeTimer.status !== "running")
            return {};

          const newElapsed = state.activeTimer.elapsed + 1;
          const isPomodoro = state.activeTimer.type === "pomodoro";

          // Check for completion
          if (isPomodoro) {
            const targetSeconds = state.activeTimer.duration * 60;
            if (newElapsed >= targetSeconds) {
              // Phase Complete
              const currentPhase = state.activeTimer.phase;
              let nextPhase: "work" | "short_break" | "long_break" = "work";
              let nextDuration = state.pomodoroSettings.workDuration;
              let newCycles = state.activeTimer.cyclesCompleted;

              // Prepare updates
              let updatedTasks = state.tasks;
              let updatedDailyActivity = { ...state.dailyActivity };
              let updatedSessions = state.sessions; // Init sessions

              if (currentPhase === "work") {
                newCycles += 1;
                // Decide break type
                if (
                  newCycles % state.pomodoroSettings.cyclesBeforeLongBreak ===
                  0
                ) {
                  nextPhase = "long_break";
                  nextDuration = state.pomodoroSettings.longBreakDuration;
                } else {
                  nextPhase = "short_break";
                  nextDuration = state.pomodoroSettings.shortBreakDuration;
                }

                // Log Time
                const task = state.tasks.find(
                  (t) => t.id === state.activeTimer!.taskId
                );

                if (task) {
                  const currentPomo = task.pomodoro || {
                    totalCycles: 4,
                    completedCycles: 0,
                  };

                  const durationToAdd = state.activeTimer.duration; // Full duration in minutes

                  updatedTasks = state.tasks.map((t) =>
                    t.id === task.id
                      ? {
                          ...t,
                          pomodoro: {
                            ...currentPomo,
                            completedCycles: currentPomo.completedCycles + 1,
                          },
                          duration: (t.duration || 0) + durationToAdd,
                        }
                      : t
                  );

                  const today = new Date().toISOString().split("T")[0];
                  updatedDailyActivity[today] =
                    (updatedDailyActivity[today] || 0) + durationToAdd;

                  // Record Session
                  updatedSessions = [
                    ...state.sessions,
                    {
                      id: Math.random().toString(36).substr(2, 9),
                      taskId: task.id,
                      startTime: state.activeTimer!.startTime,
                      endTime: Date.now(),
                      duration: durationToAdd,
                      type: "pomodoro",
                    },
                  ];
                }
              } else {
                // Break finished -> Back to work
                nextPhase = "work";
                nextDuration = state.pomodoroSettings.workDuration;
              }

              return {
                tasks: updatedTasks,
                dailyActivity: updatedDailyActivity,
                sessions: updatedSessions, // Return sessions
                activeTimer: {
                  ...state.activeTimer,
                  phase: nextPhase,
                  duration: nextDuration,
                  elapsed: 0,
                  cyclesCompleted: newCycles,
                  status: "running",
                },
              };
            }
          }

          return {
            activeTimer: {
              ...state.activeTimer,
              elapsed: newElapsed,
            },
          };
        }),

      addTask: (task) =>
        set((state: AppState) => ({ tasks: [...state.tasks, task] })),
      updateTask: (taskId, updates) =>
        set((state: AppState) => {
          let hasRangeUpdate = false;
          let newDatesToAdd: string[] = [];

          const currentTask = state.tasks.find((t) => t.id === taskId);
          if (!currentTask) return {};

          // Check if start/due dates are changing to valid non-empty values
          const oldStart = currentTask.startDate;
          const oldDue = currentTask.dueDate;
          const newStart =
            "startDate" in updates ? updates.startDate : oldStart;
          const newDue = "dueDate" in updates ? updates.dueDate : oldDue;

          // If both exist and are valid strings
          if (newStart && newDue) {
            // Basic validation: ensure logic runs if they are different from before OR if we just want to enforce it on every update that has these fields.
            // We'll calculate the range.
            const start = new Date(newStart);
            const end = new Date(newDue);

            if (
              !isNaN(start.getTime()) &&
              !isNaN(end.getTime()) &&
              start <= end
            ) {
              // Generate dates
              let loop = new Date(start);
              while (loop <= end) {
                newDatesToAdd.push(loop.toISOString().split("T")[0]);
                loop.setDate(loop.getDate() + 1);
              }
              hasRangeUpdate = true;
            }
          }

          return {
            tasks: state.tasks.map((t) => {
              if (t.id !== taskId) return t;

              let updatedTask = { ...t, ...updates };

              if (hasRangeUpdate) {
                // UNION Update: Add new dates, keep existing ones.
                const existingDates = new Set(updatedTask.dates || []);
                newDatesToAdd.forEach((d) => existingDates.add(d));
                updatedTask.dates = Array.from(existingDates).sort();
              }

              return updatedTask;
            }),
          };
        }),
      deleteTask: (taskId) =>
        set((state: AppState) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),

      addFolder: (folder) =>
        set((state: AppState) => ({ folders: [...state.folders, folder] })),
      updateFolder: (folderId, updates) =>
        set((state: AppState) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, ...updates } : f
          ),
        })),
      deleteFolder: (folderId) =>
        set((state: AppState) => {
          // Move tasks in this folder to inbox
          const updatedTasks = state.tasks.map((t) =>
            t.listId === folderId ? { ...t, listId: "inbox" } : t
          );

          return {
            folders: state.folders.filter((f) => f.id !== folderId),
            tasks: updatedTasks,
          };
        }),
    }),
    {
      name: "flow-cal-storage",
      partialize: (state) =>
        ({
          tasks: state.tasks,
          folders: state.folders,
          dailyActivity: state.dailyActivity,
          sessions: state.sessions,
          pomodoroSettings: state.pomodoroSettings,
          theme: state.theme,
        } as unknown as AppState),
    }
  )
);
