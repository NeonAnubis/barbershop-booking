"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selectedDate, onDateSelect, className }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState(selectedDate || new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className={cn("p-3 select-none", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold text-sm">
          {monthNames[month]} {year}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;

          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate && date.getTime() === new Date(selectedDate.setHours(0, 0, 0, 0)).getTime();

          return (
            <button
              key={i}
              onClick={() => onDateSelect?.(new Date(year, month, day))}
              className={cn(
                "w-full aspect-square flex items-center justify-center rounded-md text-sm transition-colors",
                isToday && !isSelected && "bg-accent text-accent-foreground font-medium",
                isSelected && "bg-primary text-primary-foreground font-medium",
                !isToday && !isSelected && "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
