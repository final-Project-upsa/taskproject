import React, { useState } from 'react';

const MonthYearSelector = ({ selectedDate, setSelectedDate }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleMonthChange = (e) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(e.target.value));
    setSelectedDate(newDate);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(e.target.value));
    setSelectedDate(newDate);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowPicker(!showPicker)}
        className="px-3 py-1 bg-white rounded-md shadow-sm text-sm font-medium"
      >
        {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}
      </button>
      {showPicker && (
        <div className="absolute top-10 left-0 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex gap-2">
            <select
              value={selectedDate.getMonth()}
              onChange={handleMonthChange}
              className="p-2 border rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(selectedDate.getFullYear(), i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedDate.getFullYear()}
              onChange={handleYearChange}
              className="p-2 border rounded-lg"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={selectedDate.getFullYear() - 5 + i}>
                  {selectedDate.getFullYear() - 5 + i}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearSelector;