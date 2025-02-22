import React from 'react';

const ProgressRing = ({ progress, size = 40, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgb(229, 231, 235)"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgb(99, 102, 241)"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {progress}%
      </div>
    </div>
  );
};

export default ProgressRing;