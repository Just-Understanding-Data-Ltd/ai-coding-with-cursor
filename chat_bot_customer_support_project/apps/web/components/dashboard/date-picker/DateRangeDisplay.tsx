import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateRangeDisplayProps {
  dateRange: DateRange | undefined;
  onClick?: () => void;
}

export function DateRangeDisplay({
  dateRange,
  onClick,
}: DateRangeDisplayProps) {
  return (
    <Button
      id="date"
      variant={"outline"}
      onClick={onClick}
      className={cn(
        "h-10 w-full justify-between items-center text-left text-base font-medium",
        !dateRange && "text-muted-foreground"
      )}
    >
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateRange?.from && dateRange?.to ? (
          <span>
            {format(dateRange.from, "MMM dd, yyyy")} to{" "}
            {format(dateRange.to, "MMM dd, yyyy")}
          </span>
        ) : (
          <span>Pick a date range</span>
        )}
      </div>
    </Button>
  );
}
