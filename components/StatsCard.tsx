import React from 'react';
import { Info } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, tooltip }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-start justify-between shadow-lg hover:bg-slate-750 transition-colors relative group/card">
      <div>
        <div className="flex items-center mb-1">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
            {tooltip && (
                <div className="group/tooltip relative ml-2">
                    <Info className="h-3.5 w-3.5 text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-slate-200 text-xs rounded shadow-xl border border-slate-700 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 text-center leading-relaxed">
                        {tooltip}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
                    </div>
                </div>
            )}
        </div>
        <h3 className="text-2xl font-bold text-white font-mono">{value}</h3>
        {subValue && <p className="text-slate-500 text-sm mt-1">{subValue}</p>}
      </div>
      {icon && <div className="text-blue-400 bg-blue-500/10 p-2 rounded-md">{icon}</div>}
    </div>
  );
};