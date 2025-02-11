import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeekSelector = ({ selectedDate, setSelectedDate }) => {
  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
      <button 
        onClick={() => navigateWeek(-1)}
        className="p-1 hover:bg-white rounded-md transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="px-3 py-1 bg-white rounded-md shadow-sm text-sm font-medium">
        Week {getWeekNumber(selectedDate)}
      </span>
      <button 
        onClick={() => navigateWeek(1)}
        className="p-1 hover:bg-white rounded-md transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default WeekSelector;