import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";

interface DateTimePickerProps {
  date?: string;
  time?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateLabel?: string;
  timeLabel?: string;
  datePlaceholder?: string;
  timePlaceholder?: string;
  useNativeDatePicker?: boolean;
  // Time range options
  startHour?: number;       // Start hour (0-23), default 8 (8 AM)
  endHour?: number;         // End hour (0-23), default 18 (6 PM)
  intervalMinutes?: number; // Interval in minutes, default 15
}

// Generate time slots within a range
const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number) => {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const time24 = `${hourStr}:${minuteStr}`;
      
      // Convert to 12-hour format for display
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = `${hour12}:${minuteStr} ${ampm}`;
      
      slots.push({ value: time24, label: displayTime });
    }
  }
  
  // Add the end hour (e.g., 6:00 PM if endHour is 18)
  const endHourStr = endHour.toString().padStart(2, '0');
  const endHour12 = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
  const endAmpm = endHour >= 12 ? 'PM' : 'AM';
  slots.push({ 
    value: `${endHourStr}:00`, 
    label: `${endHour12}:00 ${endAmpm}` 
  });
  
  return slots;
};

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  datePlaceholder = "Select date",
  timePlaceholder = "Select time",
  useNativeDatePicker = true,
  startHour = 8,        // Default: 8 AM
  endHour = 18,         // Default: 6 PM
  intervalMinutes = 15, // Default: 15 minute intervals
}: DateTimePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Memoize time slots so they're only regenerated when range changes
  const timeSlots = useMemo(
    () => generateTimeSlots(startHour, endHour, intervalMinutes),
    [startHour, endHour, intervalMinutes]
  );

  const selectedDate = date ? new Date(date + 'T00:00:00') : undefined;

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      onDateChange(`${year}-${month}-${day}`);
    } else {
      onDateChange('');
    }
    setIsCalendarOpen(false);
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const slot = timeSlots.find(s => s.value === timeStr);
    return slot ? slot.label : timeStr;
  };

  // Native date picker version (more reliable in modals)
  if (useNativeDatePicker) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{dateLabel}</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              value={date || ''}
              onChange={handleNativeDateChange}
              className="pl-10"
              placeholder={datePlaceholder}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{timeLabel}</label>
          <Select value={time} onValueChange={onTimeChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <SelectValue placeholder={timePlaceholder}>
                  {time ? getDisplayTime(time) : timePlaceholder}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Custom calendar popover version (may have issues in modals)
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{dateLabel}</label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCalendarOpen(true);
              }}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? formatDisplayDate(date) : <span>{datePlaceholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 z-[9999]" 
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{timeLabel}</label>
        <Select value={time} onValueChange={onTimeChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <SelectValue placeholder={timePlaceholder}>
                {time ? getDisplayTime(time) : timePlaceholder}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {timeSlots.map((slot) => (
              <SelectItem key={slot.value} value={slot.value}>
                {slot.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}