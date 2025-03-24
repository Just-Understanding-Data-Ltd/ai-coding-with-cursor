"use client";

import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  subMonths,
  isBefore,
  parse,
  format,
} from "date-fns";
import { DateRangeDisplay } from "./DateRangeDisplay";

const DATE_FORMAT = "yyyy-MM-dd";

function formatDate(date: Date) {
  return format(date, DATE_FORMAT);
}

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const presets = [
  {
    label: "Last 30 Days",
    getValue: () => ({
      from: addDays(new Date(), -30),
      to: new Date(),
    }),
  },
  {
    label: "Last Month",
    getValue: () => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "Last 6 Months",
    getValue: () => ({
      from: addMonths(new Date(), -6),
      to: new Date(),
    }),
  },
  {
    label: "Last Year",
    getValue: () => ({
      from: addMonths(new Date(), -12),
      to: new Date(),
    }),
  },
];

export default function DateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: DateRangePickerProps) {
  // Create dateRange from URL params
  const dateRange: DateRange = {
    from: parse(startDate, DATE_FORMAT, new Date()),
    to: parse(endDate, DATE_FORMAT, new Date()),
  };

  const handleDateRangeChange = async (newRange: DateRange | undefined) => {
    // If no range or incomplete range, reset to defaults
    if (!newRange?.from || !newRange?.to) {
      // If we have a from date but no to date, keep the from date
      if (newRange?.from) {
        await setStartDate(formatDate(newRange.from));
        return;
      }
      // Otherwise reset both to defaults
      await Promise.all([setStartDate(startDate), setEndDate(endDate)]);
      return;
    }

    // Ensure dates are in correct order
    const finalStartDate = isBefore(newRange.from, newRange.to)
      ? newRange.from
      : newRange.to;
    const finalEndDate = isBefore(newRange.from, newRange.to)
      ? newRange.to
      : newRange.from;
    
    // Update both dates simultaneously
    await Promise.all([
      setStartDate(formatDate(finalStartDate)),
      setEndDate(formatDate(finalEndDate)),
    ]);
  };

  return (
    <div className="w-full" data-testid="date-range-picker">
      <Popover>
        <PopoverTrigger asChild>
          <div className="w-full">
            <DateRangeDisplay dateRange={dateRange} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
          <div className="flex">
            <div className="border-r p-3 w-[200px] space-y-2">
              <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                Quick Select
              </div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    const range = preset.getValue();
                    handleDateRangeChange(range);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
                toDate={new Date()}
                showOutsideDays={false}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
