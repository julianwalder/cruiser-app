import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

function formatZohoDate(date: Date | null, hour: number | null, minute: number | null) {
  if (!date || hour === null || minute === null) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${day}-${month}-${year} ${h}:${m}`;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  placeholder = "dd-MMM-yyyy HH:mm",
  className = ""
}) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [selectedHour, setSelectedHour] = useState<number | null>(value ? new Date(value).getHours() : null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(value ? new Date(value).getMinutes() : null);
  const [mode, setMode] = useState<'calendar' | 'hour' | 'minute'>('calendar');
  const [inputFocus, setInputFocus] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse value if changed externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setSelectedDate(d);
      setSelectedHour(d.getHours());
      setSelectedMinute(d.getMinutes());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputFocus(false);
        setMode('calendar');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    // If hour/minute already selected, update value
    if (selectedHour !== null && selectedMinute !== null) {
      const iso = new Date(newDate.setHours(selectedHour, selectedMinute, 0, 0)).toISOString();
      onChange(iso);
    }
  };

  // Handle hour/minute selection
  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    setMode('minute');
    // If date and minute already selected, update value
    if (selectedDate && selectedMinute !== null) {
      const iso = new Date(selectedDate.setHours(h, selectedMinute, 0, 0)).toISOString();
      onChange(iso);
    }
  };
  const handleMinuteSelect = (m: number) => {
    setSelectedMinute(m);
    // If date and hour already selected, update value
    if (selectedDate && selectedHour !== null) {
      const iso = new Date(selectedDate.setHours(selectedHour, m, 0, 0)).toISOString();
      onChange(iso);
    }
    setIsOpen(false);
    setInputFocus(false);
    setMode('calendar');
  };

  // Input value
  const inputValue = formatZohoDate(selectedDate, selectedHour, selectedMinute);

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: JSX.Element[] = [];
    // Previous month's days (gray)
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-300 select-none">
          {prevMonthDays - firstDay + i + 1}
        </div>
      );
    }
    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate &&
        day === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear();
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-150 text-base ${
            isSelected ? 'bg-red-500 text-white shadow' : 'text-gray-900 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    // Next month's days (gray)
    const totalCells = firstDay + daysInMonth;
    for (let i = 0; i < (7 - (totalCells % 7)) % 7; i++) {
      days.push(
        <div key={`next-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-300 select-none">
          {i + 1}
        </div>
      );
    }
    return days;
  };

  // Render hour grid
  const renderHourGrid = () => (
    <div className="flex flex-col w-full">
      <div className="flex items-center mb-4">
        <button onClick={() => setMode('calendar')} className="text-red-500 text-sm font-medium mr-2">&lt; Back</button>
        <span className="text-gray-700 font-semibold">Pick Hour</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 24 }, (_, h) => (
          <button
            key={h}
            onClick={() => handleHourSelect(h)}
            className={`w-10 h-10 rounded font-medium text-base transition-all duration-150 ${
              selectedHour === h ? 'bg-red-500 text-white' : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {String(h).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );

  // Render minute grid
  const renderMinuteGrid = () => (
    <div className="flex flex-col w-full">
      <div className="flex items-center mb-4">
        <button onClick={() => setMode('hour')} className="text-red-500 text-sm font-medium mr-2">&lt; Back</button>
        <span className="text-gray-700 font-semibold">Pick Minute</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
          <button
            key={m}
            onClick={() => handleMinuteSelect(m)}
            className={`w-10 h-10 rounded font-medium text-base transition-all duration-150 ${
              selectedMinute === m ? 'bg-red-500 text-white' : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {String(m).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );

  // Main render
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onFocus={() => { setIsOpen(true); setInputFocus(true); }}
          onClick={() => { setIsOpen(true); setInputFocus(true); }}
          readOnly
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-base border rounded-md focus:outline-none transition-all duration-150 ${
            inputFocus ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={() => { setIsOpen(!isOpen); setInputFocus(!isOpen); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 mt-2 w-[370px] bg-white border border-gray-200 rounded-xl shadow-2xl p-6"
        >
          {mode === 'calendar' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-lg font-semibold text-gray-900 select-none">
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-gray-500 select-none">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {renderCalendar()}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('hour')}
                  className="px-3 py-2 border border-gray-300 rounded text-base font-semibold text-gray-700 hover:border-red-400 focus:border-red-500 focus:outline-none"
                >
                  {selectedHour !== null ? String(selectedHour).padStart(2, '0') : '--'}
                </button>
                <span className="text-lg font-bold text-gray-500 select-none">:</span>
                <button
                  type="button"
                  onClick={() => setMode('minute')}
                  className="px-3 py-2 border border-gray-300 rounded text-base font-semibold text-gray-700 hover:border-red-400 focus:border-red-500 focus:outline-none"
                >
                  {selectedMinute !== null ? String(selectedMinute).padStart(2, '0') : '--'}
                </button>
              </div>
            </>
          )}
          {mode === 'hour' && renderHourGrid()}
          {mode === 'minute' && renderMinuteGrid()}
        </div>
      )}
    </div>
  );
}; 