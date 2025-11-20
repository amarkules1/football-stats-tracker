import React, { useState } from 'react';
import { Activity, Search, Download, Database, ChevronRight, Calendar, Shield, Users, ListFilter } from 'lucide-react';
import { fetchGameData, fetchGameSchedule } from './services/geminiService';
import { GameData, ExtractionStatus, ExtractionRequest, GameScheduleItem } from './types';
import { StatsCard } from './components/StatsCard';
import { TeamComparison } from './components/TeamComparison';
import { PlayerTable } from './components/PlayerTable';

const App: React.FC = () => {
  // State for form inputs
  const [season, setSeason] = useState<string>('2023');
  const [week, setWeek] = useState<string>('1');
  const [team, setTeam] = useState<string>('');

  // State for data management
  const [status, setStatus] = useState<ExtractionStatus>(ExtractionStatus.IDLE);
  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GameData[]>([]);
  const [schedule, setSchedule] = useState<GameScheduleItem[]>([]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!season || !week) return;

    setStatus(ExtractionStatus.LOADING);
    setError(null);
    setData(null);
    setSchedule([]);

    try {
      // If team is specified, go straight to data extraction
      if (team.trim()) {
        const request: ExtractionRequest = { season, week, team: team.trim() };
        const result = await fetchGameData(request);
        setData(result);
        setHistory(prev => [result, ...prev]);
        setStatus(ExtractionStatus.SUCCESS);
      } else {
        // If no team specified, fetch schedule first
        const games = await fetchGameSchedule(season, week);
        setSchedule(games);
        setStatus(ExtractionStatus.SELECTING_GAME);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while fetching data.");
      setStatus(ExtractionStatus.ERROR);
    }
  };

  const handleGameSelect = async (game: GameScheduleItem) => {
    setStatus(ExtractionStatus.LOADING);
    setError(null);
    // Keep schedule visible or clear it? Let's clear it to focus on result, 
    // but we could keep it if we wanted a master-detail view. 
    // For now, clear to match single-result flow.
    setSchedule([]); 

    try {
      const request: ExtractionRequest = { 
        season, 
        week, 
        specificMatchup: { home: game.homeTeam, away: game.awayTeam } 
      };
      const result = await fetchGameData(request);
      setData(result);
      setHistory(prev => [result, ...prev]);
      setStatus(ExtractionStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while fetching game stats.");
      setStatus(ExtractionStatus.ERROR);
    }
  };

  const downloadJson = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfl_stats_${data.season}_w${data.week}_${data.awayTeam.teamName}_at_${data.homeTeam.teamName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Gridiron AI Extractor
            </h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
             Historical NFL Data Scraper
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Control Panel */}
        <section className="mb-10">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center mb-6">
                    <Search className="h-5 w-5 text-blue-400 mr-2" />
                    <h2 className="text-lg font-semibold text-white">Extraction Parameters</h2>
                </div>
                
                <form onSubmit={handleExtract} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Season</label>
                        <select 
                            value={season} 
                            onChange={(e) => setSeason(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        >
                            <option value="2024">2024 Season</option>
                            <option value="2023">2023 Season</option>
                            <option value="2022">2022 Season</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Week</label>
                        <select 
                            value={week} 
                            onChange={(e) => setWeek(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        >
                            {Array.from({ length: 18 }, (_, i) => i + 1).map(w => (
                                <option key={w} value={w.toString()}>Week {w}</option>
                            ))}
                            <option value="Wildcard">Wild Card</option>
                            <option value="Divisional">Divisional</option>
                            <option value="Conference">Conference</option>
                            <option value="SuperBowl">Super Bowl</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Team (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="Leave empty to see all games"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder-slate-600"
                        />
                    </div>

                    <div className="flex items-end">
                        <button 
                            type="submit"
                            disabled={status === ExtractionStatus.LOADING}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === ExtractionStatus.LOADING ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {team ? 'Run Extraction' : 'Find Games'}
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>

        {/* Error Display */}
        {status === ExtractionStatus.ERROR && error && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 flex items-start">
                <Shield className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                    <h3 className="text-red-400 font-medium">Extraction Failed</h3>
                    <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
             </div>
        )}

        {/* Game Selection Grid */}
        {status === ExtractionStatus.SELECTING_GAME && schedule.length > 0 && (
            <div className="animate-fade-in-up mb-10">
                 <div className="flex items-center mb-6">
                    <ListFilter className="h-5 w-5 text-emerald-400 mr-2" />
                    <h2 className="text-lg font-semibold text-white">Select a Game to Extract Stats</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedule.map((game, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleGameSelect(game)}
                            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 p-5 rounded-xl text-left transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></div>
                            <div className="ml-2">
                                <p className="text-slate-400 text-xs font-mono mb-2">{game.date}</p>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{game.awayTeam}</h3>
                                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">AT</p>
                                        <h3 className="text-white font-bold text-lg">{game.homeTeam}</h3>
                                    </div>
                                    {game.scoreSummary && (
                                        <div className="bg-slate-900/50 px-3 py-2 rounded text-right">
                                            <span className="text-emerald-400 font-mono text-sm block">{game.scoreSummary}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Results Display */}
        {data && status === ExtractionStatus.SUCCESS && (
            <div className="animate-fade-in-up">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {data.awayTeam.teamName} <span className="text-slate-500">@</span> {data.homeTeam.teamName}
                        </h2>
                        <p className="text-slate-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {data.date} &bull; Season {data.season} Week {data.week}
                        </p>
                    </div>
                    <button 
                        onClick={downloadJson}
                        className="mt-4 md:mt-0 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                    </button>
                </div>

                {/* High Level Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                     <StatsCard 
                        title="Total Points" 
                        value={data.homeTeam.score + data.awayTeam.score} 
                        subValue={`${data.awayTeam.score} - ${data.homeTeam.score}`}
                        icon={<Activity className="h-6 w-6" />}
                    />
                     <StatsCard 
                        title="Total Yards" 
                        value={data.homeTeam.rushingYards + data.homeTeam.passingYards + data.awayTeam.rushingYards + data.awayTeam.passingYards}
                        subValue="Combined Offense"
                        icon={<Activity className="h-6 w-6" />}
                    />
                     <StatsCard 
                        title="Est. Possessions" 
                        value={(data.homeTeam.possessions + data.awayTeam.possessions).toFixed(0)}
                        subValue={`Away: ${data.awayTeam.possessions} • Home: ${data.homeTeam.possessions}`}
                        tooltip="Estimated total number of offensive drives for both teams combined."
                    />
                     <StatsCard 
                        title="Turnovers" 
                        value={data.homeTeam.turnovers + data.awayTeam.turnovers}
                        subValue={`Sacks: ${data.homeTeam.sacks + data.awayTeam.sacks}`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Team Stats Comparison */}
                    <div className="lg:col-span-2">
                         <TeamComparison home={data.homeTeam} away={data.awayTeam} />
                    </div>
                    
                    {/* Game Summary */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg mt-6 lg:mt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Game Summary</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            {data.summary}
                        </p>
                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Data Sources</h4>
                            <div className="flex flex-col gap-2">
                                {data.sourceUrls.slice(0, 3).map((url, i) => (
                                    <a 
                                        key={i} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 truncate block"
                                    >
                                        {url}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Player Statistics */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-700 flex items-center">
                        <Users className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-lg font-semibold text-white">Key Player Statistics</h3>
                    </div>
                    <PlayerTable players={data.playerStats} />
                </div>

            </div>
        )}

        {/* Empty State / History Prompt */}
        {(!data && status !== ExtractionStatus.LOADING && status !== ExtractionStatus.SELECTING_GAME && history.length > 0) && (
            <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6">Extraction History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((game) => (
                         <div key={game.id} onClick={() => setData(game)} className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors group">
                            <p className="text-xs text-slate-500 mb-1">{game.season} Week {game.week}</p>
                            <h4 className="text-white font-medium group-hover:text-blue-400">{game.awayTeam.teamName} @ {game.homeTeam.teamName}</h4>
                         </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;