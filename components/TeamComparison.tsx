import React from 'react';
import { TeamGameStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  home: TeamGameStats;
  away: TeamGameStats;
}

export const TeamComparison: React.FC<Props> = ({ home, away }) => {
  const data = [
    { name: 'Score', [home.teamName]: home.score, [away.teamName]: away.score },
    { name: 'Rush Yds', [home.teamName]: home.rushingYards, [away.teamName]: away.rushingYards },
    { name: 'Pass Yds', [home.teamName]: home.passingYards, [away.teamName]: away.passingYards },
    { name: 'Plays', [home.teamName]: home.totalPlays, [away.teamName]: away.totalPlays },
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg mt-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
        Head-to-Head Comparison
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
              cursor={{fill: 'transparent'}}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey={away.teamName} fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
            <Bar dataKey={home.teamName} fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};