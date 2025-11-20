import React from 'react';
import { PlayerStats, Position } from '../types';

interface Props {
  players: PlayerStats[];
}

export const PlayerTable: React.FC<Props> = ({ players }) => {
  const formatStats = (p: PlayerStats) => {
    const parts = [];
    if (p.passingYards) parts.push(`${p.passingYards} Pass Yds`);
    if (p.passingTDs) parts.push(`${p.passingTDs} TD`);
    if (p.interceptions) parts.push(`${p.interceptions} INT`);
    if (p.rushingYards) parts.push(`${p.rushingYards} Rush Yds`);
    if (p.rushingTDs) parts.push(`${p.rushingTDs} TD`);
    if (p.receptions) parts.push(`${p.receptions} Rec`);
    if (p.receivingYards) parts.push(`${p.receivingYards} Rec Yds`);
    if (p.receivingTDs) parts.push(`${p.receivingTDs} TD`);
    return parts.join(', ');
  };

  const getPosColor = (pos: Position) => {
    switch (pos) {
      case Position.QB: return 'bg-red-500/20 text-red-300 border-red-500/30';
      case Position.RB: return 'bg-green-500/20 text-green-300 border-green-500/30';
      case Position.WR: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case Position.TE: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-700/50 text-slate-200 uppercase font-medium">
          <tr>
            <th className="px-6 py-3">Player</th>
            <th className="px-6 py-3">Team</th>
            <th className="px-6 py-3">Position</th>
            <th className="px-6 py-3">Key Stats</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {players.map((player, idx) => (
            <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{player.name}</td>
              <td className="px-6 py-4">{player.team}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs border ${getPosColor(player.position)}`}>
                  {player.position}
                </span>
              </td>
              <td className="px-6 py-4 font-mono text-slate-300">{formatStats(player)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
