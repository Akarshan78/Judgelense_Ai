
import React, { useState } from 'react';
import { EvaluationResult } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

interface Props {
  result: EvaluationResult;
  onReset: () => void;
}

const EvaluationResults: React.FC<Props> = ({ result, onReset }) => {
  // Track which suggestion cards are expanded
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const chartData = result.categories.map(cat => ({
    subject: cat.name,
    A: cat.score,
    fullMark: 100,
  }));

  const isAccepted = result.prediction === 'Acceptance';
  const hexColor = isAccepted ? '#10b981' : '#ef4444';

  return (
    <div className="space-y-10 pb-20 animate-in" style={{ animationDuration: '0.6s' }}>
      
      {/* Top Section: Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Score Circle with glow */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center w-48 h-48">
            {/* Outer breathing glow */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl animate-[pulse_3s_ease-in-out_infinite]"
              style={{ background: `radial-gradient(circle, ${hexColor}20 0%, transparent 70%)` }}
            ></div>
            {/* Secondary glow ring */}
            <div 
              className="absolute inset-[-8px] rounded-full animate-[pulse_4s_ease-in-out_infinite_0.5s]"
              style={{ background: `radial-gradient(circle, transparent 60%, ${hexColor}10 80%, transparent 100%)` }}
            ></div>
            <svg className="w-full h-full transform -rotate-90 relative z-10">
              <circle
                cx="50%" cy="50%" r="70"
                className="stroke-zinc-800 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="50%" cy="50%" r="70"
                className="fill-none verdict-ring"
                style={{ 
                  stroke: hexColor,
                  filter: `drop-shadow(0 0 8px ${hexColor}60)`
                }}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.overallScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
              <span className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{result.overallScore}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Score</span>
            </div>
          </div>
          <div className="text-center">
            <div 
              className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${isAccepted ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
              style={{ animation: 'pulse 3s ease-in-out infinite' }}
            >
              <i className={`fas ${isAccepted ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
              {result.prediction} ({(result.probability * 100).toFixed(0)}%)
            </div>
          </div>
        </div>

        {/* Critique Card with glow */}
        <div className="lg:col-span-8">
          <div className="relative group">
            {/* Background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="relative glass p-8 rounded-2xl border border-zinc-800 group-hover:border-emerald-500/20 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md animate-[pulse_3s_ease-in-out_infinite]"></div>
                  <div className="relative w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-emerald-500/20">
                    <i className="fas fa-user-tie text-emerald-400"></i>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-emerald-400 uppercase tracking-wider">Judge Review</p>
                  <p className="text-lg font-semibold text-white">{result.judgePersona}</p>
                </div>
              </div>

              <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-emerald-500/30 pl-6 hover:border-emerald-500/50 transition-colors duration-300">
                "{result.critique}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Scores with glow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Radar Chart Card */}
        <div className="md:col-span-2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative glass p-6 rounded-2xl border border-zinc-800 group-hover:border-emerald-500/20 transition-all duration-300">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Analysis Breakdown</h3>
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Scores List with glow */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative glass p-6 rounded-2xl border border-zinc-800 group-hover:border-emerald-500/20 transition-all duration-300 flex flex-col h-full">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Category Scores</h3>
            <div className="space-y-4 flex-grow">
              {result.categories.map((cat, index) => (
                <div key={cat.name} className="space-y-2 group/item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white group-hover/item:text-emerald-50 transition-colors duration-300">{cat.name}</span>
                    <span className="text-sm font-semibold text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]">{cat.score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      style={{ width: `${cat.score}%` }}
                    ></div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.2}s` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Category Feedback Section */}
      {result.categories.some(cat => cat.feedback) && (
        <div className="glass p-8 rounded-[2.5rem] space-y-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Detailed Category Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.categories.map((cat) => (
              <div key={`feedback-${cat.name}`} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white">{cat.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    cat.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                    cat.score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {cat.score}/100
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {cat.feedback || "No detailed feedback available for this category."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmark Comparison Section */}
      {result.benchmarkComparison && (
        <div className="glass p-8 rounded-[2.5rem] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <i className="fas fa-chart-line text-indigo-400"></i>
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Market Comparison</h3>
          </div>
          <p className="text-slate-300 leading-relaxed pl-13">
            {result.benchmarkComparison}
          </p>
        </div>
      )}

      {/* Recommendations with glow */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="relative">
              <span className="absolute inset-0 bg-emerald-500/20 blur-lg animate-[pulse_3s_ease-in-out_infinite]"></span>
              <i className="fas fa-lightbulb text-emerald-400 relative"></i>
            </span>
            Improvement Suggestions
          </h3>
          <p className="text-zinc-500 text-sm mt-1">Actionable steps to improve your project</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.suggestions.map((s, i) => {
            const isExpanded = expandedCards.has(i);
            const difficultyColors = {
              'High': { bg: 'from-red-500/10 to-orange-500/5', border: 'hover:border-red-500/30', glow: 'rgba(239,68,68,0.15)' },
              'Medium': { bg: 'from-amber-500/10 to-yellow-500/5', border: 'hover:border-amber-500/30', glow: 'rgba(245,158,11,0.15)' },
              'Low': { bg: 'from-emerald-500/10 to-teal-500/5', border: 'hover:border-emerald-500/30', glow: 'rgba(16,185,129,0.15)' }
            };
            const colors = difficultyColors[s.difficulty] || difficultyColors['Medium'];
            
            return (
              <div 
                key={i} 
                className={`relative group ${isExpanded ? 'md:col-span-3' : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Hover glow effect */}
                <div 
                  className={`absolute -inset-0.5 bg-gradient-to-br ${colors.bg} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`}
                  style={{ boxShadow: `0 0 30px ${colors.glow}` }}
                ></div>
                <div className={`relative glass rounded-2xl border border-zinc-800 ${colors.border} transition-all duration-300 group-hover:shadow-lg`}>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium shadow-[0_0_10px_rgba(16,185,129,0.2)]">{s.area}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        s.difficulty === 'High' ? 'text-red-400 bg-red-500/10' :
                        s.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                      }`}>{s.difficulty}</span>
                    </div>
                    <p className={`text-zinc-300 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {s.advice}
                    </p>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        {/* Time estimate based on difficulty */}
                        <div className="flex items-center gap-2 text-xs">
                          <i className="fas fa-clock text-zinc-600"></i>
                          <span className="text-zinc-500">
                            Estimated time: {s.difficulty === 'Low' ? '1-2 hours' : s.difficulty === 'Medium' ? '4-8 hours' : '1-2 days'}
                          </span>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => toggleCard(i)}
                      className="mt-4 flex items-center text-emerald-400 hover:text-emerald-300 transition-all duration-300 text-sm group/btn"
                    >
                      <span className="mr-2">{isExpanded ? 'Show less' : 'View details'}</span>
                      <i className={`fas fa-arrow-right text-xs transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover/btn:translate-x-1'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <div className="relative group">
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <button
            onClick={onReset}
            className="relative px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-all duration-300 flex items-center space-x-3 border border-zinc-700 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <i className="fas fa-rotate-left text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300 group-hover:animate-[spin_0.5s_ease-out]"></i>
            <span className="group-hover:text-emerald-50 transition-colors duration-300">Evaluate Another Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResults;
