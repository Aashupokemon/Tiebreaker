import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Flame,
  Compass,
  ArrowRight
} from 'lucide-react';
import { OptionSWOT } from '../types/decision';

interface SWOTViewProps {
  swot: OptionSWOT[];
}

export const SWOTView: React.FC<SWOTViewProps> = ({ swot }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = swot[selectedIdx] || swot[0];

  if (!current) return null;

  return (
    <div className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {swot.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={item.option}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-950/20 text-[10px] font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{item.option}</span>
              </button>
            );
          })}
        </div>
        <span className="text-xs text-slate-400 px-2">
          Internal capabilities vs External landscape
        </span>
      </div>

      {/* Strategic Takeaway Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/20 border border-slate-800 flex items-start gap-3.5 shadow-lg">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            Strategic Playbook for &quot;{current.option}&quot;
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {current.strategicTakeaway}
          </p>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths (Internal Positive) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Strengths</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Internal Advantages
              </span>
            </div>
            <ul className="space-y-2.5">
              {current.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-2 text-[10px] text-emerald-400/80 font-medium border-t border-slate-800">
            What you or this option controls directly
          </div>
        </div>

        {/* Weaknesses (Internal Negative) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertOctagon className="w-4 h-4" />
                <span>Weaknesses</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Internal Vulnerabilities
              </span>
            </div>
            <ul className="space-y-2.5">
              {current.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-2" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-2 text-[10px] text-rose-400/80 font-medium border-t border-slate-800">
            Friction points or deficiencies needing guardrails
          </div>
        </div>

        {/* Opportunities (External Positive) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Opportunities</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                External Upside
              </span>
            </div>
            <ul className="space-y-2.5">
              {current.opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-2 text-[10px] text-cyan-400/80 font-medium border-t border-slate-800">
            Market tailwinds, timing catalysts, or network effects
          </div>
        </div>

        {/* Threats (External Negative) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>Threats</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                External Risks
              </span>
            </div>
            <ul className="space-y-2.5">
              {current.threats.map((th, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                  <span>{th}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-2 text-[10px] text-amber-400/80 font-medium border-t border-slate-800">
            Outside shocks, competition, or changing conditions
          </div>
        </div>
      </div>
    </div>
  );
};
