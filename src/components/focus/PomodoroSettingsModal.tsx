import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Clock, Coffee, RotateCcw } from 'lucide-react';
import { useStore, type PomodoroSettings } from '@/store/useStore';

interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroSettingsModal = ({ isOpen, onClose }: PomodoroSettingsModalProps) => {
  const { pomodoroSettings, setPomodoroSettings } = useStore();

  const updateSetting = (key: keyof PomodoroSettings, value: number) => {
    setPomodoroSettings({ [key]: value > 0 ? value : 1 });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-indigo-500" />
                    Focus Settings
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Focus Duration */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>Focus Duration</span>
                      <span className="text-indigo-600 font-bold">{pomodoroSettings.workDuration} min</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="5"
                      value={pomodoroSettings.workDuration}
                      onChange={(e) => updateSetting('workDuration', Number(e.target.value))}
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Short Break */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span className="flex items-center gap-2"><Coffee size={16} /> Short Break</span>
                      <span className="text-blue-600 font-bold">{pomodoroSettings.shortBreakDuration} min</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={pomodoroSettings.shortBreakDuration}
                      onChange={(e) => updateSetting('shortBreakDuration', Number(e.target.value))}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Long Break */}
                  <div className="space-y-2">
                     <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span className="flex items-center gap-2"><Coffee size={16} /> Long Break</span>
                      <span className="text-purple-600 font-bold">{pomodoroSettings.longBreakDuration} min</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="45"
                      step="5"
                      value={pomodoroSettings.longBreakDuration}
                      onChange={(e) => updateSetting('longBreakDuration', Number(e.target.value))}
                      className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  
                  {/* Cycles */}
                  <div className="space-y-2">
                     <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span className="flex items-center gap-2"><RotateCcw size={16} /> Long Break Every</span>
                      <span className="text-gray-900 font-bold">{pomodoroSettings.cyclesBeforeLongBreak} Cycles</span>
                    </label>
                    <div className="flex justify-between gap-2">
                        {[2, 3, 4, 5, 6].map(num => (
                            <button
                                key={num}
                                onClick={() => updateSetting('cyclesBeforeLongBreak', num)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                                    pomodoroSettings.cyclesBeforeLongBreak === num 
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                  >
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
