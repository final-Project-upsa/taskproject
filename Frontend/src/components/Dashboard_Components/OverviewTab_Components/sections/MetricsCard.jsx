import React from 'react';
import { Flame, TrendingUp, Target } from 'lucide-react';
import ProgressRing from './ProgressRing';

const MetricsCard = ({ title, value, icon, progress, description, color }) => {
  const Icon = icon;

  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-lg shadow-lg text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center space-x-4">
        <ProgressRing progress={progress} />
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs opacity-75">{description}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;