import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Flame,
  AlertTriangle,
  DoorClosed,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Send,
  Eye,
  RefreshCw,
  Compass
} from 'lucide-react';
import { FullAnalysis, TiebreakerResult } from '../types/decision';

interface TiebreakerVerdictCardProps {
  analysis: FullAnalysis;
}

export const TiebreakerVerdictCard: React.FC<TiebreakerVerdictCardProps> = ({ analysis }) => {
  const { tiebreaker, decisionType, reversibilityExplanation, input } = analysis;
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [customStressTest, setCustomStressTest] = useState('');
  const [stressTestResult, setStressTestResult] = useState<any>(null);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [showStressTestBox, setShowStressTestBox] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
    });
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleRunStressTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStressTest.trim()) return;
    setIsStressTesting(true);
    try {
      const res = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: input.decision,
          chosenOption: tiebreaker.winner,
          userReasoning: customStressTest,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStressTestResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStressTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Verdict Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                The Tiebreaker Pick
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Confidence: {tiebreaker.confidenceScore}%
              </span>
            </div>

            <button
              onClick={triggerConfetti}
              className="text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Celebrate Pick 🎉
            </button>
          </div>

          {/* Winning Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {tiebreaker.headline}
          </h2>

          {/* Winner Callout Box */}
          <div className="mt-5 p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1">
                Recommended Choice:
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-100">
                {tiebreaker.winner}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Edges out: <span className="text-slate-300 font-medium">{tiebreaker.runnerUp}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Decision Framing</div>
                <div className="text-xs font-semibold text-emerald-400">{decisionType}</div>
              </div>
            </div>
          </div>

          {/* Core Rationale */}
          <div className="mt-6 text-sm sm:text-base text-slate-200 leading-relaxed space-y-3 font-normal">
            <p className="whitespace-pre-line">{tiebreaker.coreRationale}</p>
          </div>

          {/* Key Deciding Factor / Tipping Point */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider mb-1.5">
                <Compass className="w-4 h-4 text-indigo-400" />
                The Decisive Tipping Factor
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {tiebreaker.keyDecidingFactor}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider mb-1.5">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                The Conditional &quot;If-Then&quot; Rule
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {tiebreaker.conditionalRule}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reversibility & Mental Model Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Decision Reversibility: {decisionType}
            </h3>
            <p className="text-xs text-slate-400">
              Jeff Bezos's Mental Model: Type 1 (One-Way Door) vs Type 2 (Two-Way Door)
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          {reversibilityExplanation}
        </p>
      </div>

      {/* Blindspot Radar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Blindspot Radar &amp; Cognitive Biases
              </h3>
              <p className="text-xs text-slate-400">
                Hidden traps, unexamined assumptions, and psychological pitfalls
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 hidden sm:inline">
            3 Critical Traps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {tiebreaker.blindspots.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {item.title}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {item.explanation}
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-emerald-300/90 font-medium">
                <span className="font-semibold text-slate-400">How to defuse:</span> {item.advice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Devil's Advocate & Stress Testing */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Devil&apos;s Advocate Stress-Test
              </h3>
              <p className="text-xs text-slate-400">
                Interrogating the winner ({tiebreaker.winner}) before you pull the trigger
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Hard Questions */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Uncomfortable Questions You Must Answer Honestly:
            </div>
            <ul className="space-y-2">
              {tiebreaker.devilsAdvocate.hardQuestions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Worst-Case & Pre-Mortem Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="text-xs font-bold text-rose-300 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Worst-Case Scenario Check
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tiebreaker.devilsAdvocate.worstCaseScenario}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                12-Month Pre-Mortem Insight
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tiebreaker.devilsAdvocate.preMortemInsight}
              </p>
            </div>
          </div>

          {/* Interactive Stress-Test Follow-up */}
          <div className="pt-2">
            {!showStressTestBox ? (
              <button
                type="button"
                onClick={() => setShowStressTestBox(true)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Want to push back or defend the other option? Test your resolve with AI →
              </button>
            ) : (
              <form onSubmit={handleRunStressTest} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-200 block">
                  Why do you still feel drawn to {tiebreaker.runnerUp} (or what hesitation remains)?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customStressTest}
                    onChange={(e) => setCustomStressTest(e.target.value)}
                    placeholder="e.g. I'm afraid of the salary drop, or what if the commute exhausts me..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={isStressTesting || !customStressTest.trim()}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isStressTesting ? 'Interrogating...' : 'Stress-Test'}
                  </button>
                </div>

                {stressTestResult && (
                  <div className="mt-3 p-3.5 bg-slate-900 rounded-lg border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-amber-300">
                      Litmus Test: {stressTestResult.litmusTest}
                    </div>
                    <ul className="space-y-1">
                      {stressTestResult.challenges?.map((c: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                    {stressTestResult.encouragement && (
                      <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                        {stressTestResult.encouragement}
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 72-Hour Action Plan */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                The 72-Hour Execution Roadmap
              </h3>
              <p className="text-xs text-slate-400">
                Concrete, high-momentum steps to move from debate into action
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {tiebreaker.actionPlan.map((step, idx) => {
            const isDone = !!checkedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="pt-0.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-900 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {step.timeframe}
                    </span>
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {step.action}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    <span className="text-slate-500">Goal:</span> {step.purpose}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
