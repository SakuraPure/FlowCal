import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift, autoUpdate, useDismiss, useInteractions, useRole, useClick } from '@floating-ui/react';

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const DatePicker = ({ value, onChange, minDate, maxDate, placeholder, className, align = 'left', side = 'bottom' }: DatePickerProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate,
    placement: side === 'bottom' ? (align === 'right' ? 'bottom-end' : 'bottom-start') :
               side === 'top' ? (align === 'right' ? 'top-end' : 'top-start') :
               side === 'left' ? 'left-start' : 'right-start'
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Fill in empty days at start/end of month grid
  const startDay = startOfMonth(currentMonth).getDay(); // 0 is Sunday
  const emptyDays = Array(startDay).fill(null);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (value === dateStr) {
        onChange(undefined); // Toggle off if same
    } else {
        onChange(dateStr);
    }
    setIsOpen(false);
  };

  const isSelected = (day: Date) => {
    return value === format(day, 'yyyy-MM-dd');
  };

  const isDisabled = (day: Date) => {
     if (minDate && day < startOfDay(parseISO(minDate))) return true;
     if (maxDate && day > parseISO(maxDate)) return true;
     return false;
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
  };

  const displayValue = () => {
      return value || '';
  };

  return (
    <div className={clsx("relative", className)}>
      <div 
        ref={refs.setReference}
        {...getReferenceProps()}
        className={clsx(
            "flex items-center justify-between w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative", // Added relative to ensure z-index context if needed, but ring is outline.
            isOpen && "ring-2 ring-blue-100 dark:ring-blue-900 border-blue-300 dark:border-blue-700"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon size={16} className="text-gray-400 flex-shrink-0" />
            <span className={clsx("text-sm truncate select-none", !value ? "text-gray-400" : "text-gray-700 dark:text-gray-200 font-medium")}>
                {displayValue() || placeholder || t('task_detail.select_dates', 'Select Date')}
            </span>
        </div>
        {value && (
            <div role="button" onClick={handleClear} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={14} />
            </div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div 
                ref={refs.setFloating}
                style={floatingStyles}
                className="z-[9999]"
                {...getFloatingProps()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className={clsx(
                        "p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-[320px] focus:outline-none"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['S','M','T','W','T','F','S'].map(d => (
                            <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map(day => {
                            const active = isSelected(day);
                            const disabled = isDisabled(day);
                            const today = isToday(day);
                            
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => !disabled && handleDayClick(day)}
                                    disabled={disabled}
                                    className={clsx(
                                        "h-9 w-9 text-sm rounded-full flex items-center justify-center transition-all relative font-medium focus:outline-none",
                                        active ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" : 
                                        disabled ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" :
                                        "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                                        !active && today && "ring-1 ring-black/20 dark:ring-white/20 font-bold"
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                        <button onClick={() => onChange(format(new Date(), 'yyyy-MM-dd'))} className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                            {t('calendar.today', 'Today')}
                        </button>
                    </div>

                </motion.div>
            </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
