
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'IST', label: 'IST (UTC+5:30)' },
  { value: 'EST', label: 'EST (UTC-5:00)' },
  { value: 'PST', label: 'PST (UTC-8:00)' },
];

interface DateRangeSelectorProps {
  fromDate: Date;
  toDate: Date;
  timezone: string;
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
  setTimezone: (timezone: string) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  fromDate,
  toDate,
  timezone,
  setFromDate,
  setToDate,
  setTimezone,
}) => {
  const formatDate = (date: Date) => {
    return format(date, 'PP');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>From: {formatDate(fromDate)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={(date) => date && setFromDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>To: {formatDate(toDate)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={(date) => date && setToDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Select value={timezone} onValueChange={setTimezone}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DateRangeSelector;
