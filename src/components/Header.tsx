import React from 'react';
import { Scale, Sparkles, History, Coins, PlusCircle, Bookmark } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenCoinFlip: () => void;
  savedCount: number;
  hasActiveAnalysis: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenCoinFlip,
  savedCount,
  hasActiveAnalysis,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                The Tiebreaker
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                AI Referee
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Definitive clarity for tough dilemmas
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gut-Check Coin Flip */}
          <button
            onClick={onOpenCoinFlip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-sm"
            title="Fast psychological coin flip to reveal gut instinct"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Gut-Check Flip</span>
          </button>

          {/* Saved History */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">History</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* New Decision Button */}
          {hasActiveAnalysis && (
            <button
              onClick={onNewDecision}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all font-sans"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>New Dilemma</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
