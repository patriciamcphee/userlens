import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Clock } from "lucide-react";

interface DateTimeRangePickerProps {
  date: string;
  startTime: string;
  endTime: string;
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  disabled?: boolean;
}

// Generate time options in 15-minute increments for business hours (7 AM - 7 PM)
const generateTimeOptions = () => {
  const times: { value: string; label: string }[] = [];
  // Business hours: 7 AM (hour 7) to 7 PM (hour 19)
  for (let hour = 7; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour % 12 || 12;
      const period = hour < 12 ? 'AM' : 'PM';
      const label = `${h}:${minute.toString().padStart(2, '0')} ${period}`;
      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push({ value, label });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Convert 24h format to 12h display format
const formatTimeDisplay = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const h = hours % 12 || 12;
  const period = hours < 12 ? 'AM' : 'PM';
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export function DateTimeRangePicker({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
}: DateTimeRangePickerProps) {

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-1.5 p-2 border border-slate-200 rounded-lg bg-white">
      {/* Clock icon */}
      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
      
      {/* Native date input - works reliably inside Dialog */}
      <input
        type="date"
        value={date}
        onChange={handleDateChange}
        disabled={disabled}
        className="h-8 px-1 text-sm text-slate-700 bg-transparent border-0 outline-none focus:ring-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ colorScheme: 'light' }}
      />
      
      {/* "from" label */}
      <span className="text-sm text-slate-500">from</span>
      
      {/* Start time picker */}
      <Select
        value={startTime}
        onValueChange={onStartTimeChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[95px] h-8 border-0 shadow-none focus:ring-0 px-1">
          <SelectValue placeholder="Start time">
            {startTime ? formatTimeDisplay(startTime) : (
              <span className="text-slate-400">Start</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          {TIME_OPTIONS.map((time) => (
            <SelectItem key={time.value} value={time.value}>
              {time.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* "to" label */}
      <span className="text-sm text-slate-500">to</span>
      
      {/* End time picker */}
      <Select
        value={endTime}
        onValueChange={onEndTimeChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[95px] h-8 border-0 shadow-none focus:ring-0 px-1">
          <SelectValue placeholder="End time">
            {endTime ? formatTimeDisplay(endTime) : (
              <span className="text-slate-400">End</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          {TIME_OPTIONS.map((time) => (
            <SelectItem key={time.value} value={time.value}>
              {time.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default DateTimeRangePicker;