import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  Shield,
  Zap,
  Flame,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Layers,
  Wand2
} from 'lucide-react';
import { DecisionInput, PresetDilemma, RiskTolerance } from '../types/decision';
import { PRESET_DILEMMAS } from '../data/presets';

interface DecisionFormProps {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
}

const COMMON_PRIORITIES = [
  'Long-Term Upside',
  'Financial Security',
  'Work-Life Balance',
  'Career Acceleration',
  'Flexibility & Freedom',
  'Low Stress & Peace',
  'Immediate Happiness',
  'Regret Minimization'
];

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [decision, setDecision] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [context, setContext] = useState('');
  const [priorities, setPriorities] = useState<string[]>([
    'Long-Term Upside',
    'Financial Security'
  ]);
  const [customPriority, setCustomPriority] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('balanced');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const next = options.filter((_, i) => i !== index);
      setOptions(next);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;
    setOptions(next);
  };

  const togglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter((item) => item !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleAddCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPriority.trim() && !priorities.includes(customPriority.trim())) {
      setPriorities([...priorities, customPriority.trim()]);
      setCustomPriority('');
    }
  };

  const loadPreset = (preset: PresetDilemma) => {
    setDecision(preset.question);
    setOptions(preset.options);
    setContext(preset.context);
    setPriorities(preset.priorities);
    setRiskTolerance(preset.riskTolerance);
    setShowAdvanced(true);
  };

  const handleAutoSuggest = async () => {
    if (!decision.trim()) return;
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.options && Array.isArray(data.options) && data.options.length >= 2) {
          setOptions(data.options.slice(0, 4));
        }
        if (data.suggestedPriorities && Array.isArray(data.suggestedPriorities)) {
          setPriorities(data.suggestedPriorities.slice(0, 5));
        }
        setShowAdvanced(true);
      }
    } catch (e) {
      console.error('Suggest error:', e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;

    // Filter valid options or supply defaults
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    const finalOptions = validOptions.length >= 2 ? validOptions : ['Option 1', 'Option 2'];

    onSubmit({
      decision: decision.trim(),
      options: finalOptions,
      context: context.trim(),
      priorities,
      riskTolerance,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          End Decision Paralysis
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight">
          Stuck between choices?{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">
            Let the Tiebreaker settle it.
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Frame your dilemma. Get multi-layered pros &amp; cons, a weighted comparison matrix, SWOT analysis, and a definitive tiebreaker verdict with blindspot detection.
        </p>

        {/* Quick Presets Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Examples:
          </span>
          {PRESET_DILEMMAS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
      >
        {/* Decision Question */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                1
              </span>
              What decision are you trying to make?
            </label>
            {decision.length > 10 && (
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={isSuggesting}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isSuggesting ? 'Thinking...' : 'AI Auto-Fill Options'}
              </button>
            )}
          </div>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g. Should I accept the Senior Product Manager offer at Stripe or stay at my current tech startup? Or: Should we buy our first home now or wait another 2 years?"
            rows={2}
            required
            className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
          />
        </div>

        {/* Options to Compare */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                2
              </span>
              What are the options on the table?
            </label>
            <span className="text-xs text-slate-400">
              {options.length}/5 options
            </span>
          </div>

          <div className="space-y-3">
            {options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                    {letter}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${letter} (e.g. ${
                      idx === 0
                        ? 'Accept new job offer with equity'
                        : idx === 1
                        ? 'Stay at current stable role'
                        : 'Explore freelance consulting'
                    })`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-3 text-xs font-medium text-slate-300 hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-amber-500/40 bg-slate-800/40 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another alternative (Option {String.fromCharCode(65 + options.length)})
            </button>
          )}
        </div>

        {/* Toggle Advanced Context & Calibration */}
        <div className="pt-2 pb-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer py-1"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              {showAdvanced ? 'Hide Priorities & Risk Calibration' : 'Customize Priorities, Risk Tolerance & Constraints (Recommended)'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {showAdvanced ? 'Collapse ▲' : 'Expand ▼'}
            </span>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-6 pt-2 pb-4 animate-in fade-in duration-200">
            {/* Risk Tolerance Selector */}
            <div>
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Your Risk Appetite for this Decision
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'conservative',
                    label: 'Conservative',
                    desc: 'Prioritize downside protection & peace of mind',
                    icon: Shield,
                    color: 'text-emerald-400 border-emerald-500/30'
                  },
                  {
                    id: 'balanced',
                    label: 'Balanced',
                    desc: 'Calculated risk for strong long-term upside',
                    icon: Zap,
                    color: 'text-amber-400 border-amber-500/30'
                  },
                  {
                    id: 'aggressive',
                    label: 'Aggressive / High Growth',
                    desc: 'Maximize upside; tolerate near-term volatility',
                    icon: Flame,
                    color: 'text-rose-400 border-rose-500/30'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = riskTolerance === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRiskTolerance(item.id as RiskTolerance)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? `bg-slate-800/90 ${item.color} ring-1 ring-amber-400/40`
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Priorities */}
            <div>
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                  4
                </span>
                What factors matter most to you? (Select or add)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_PRIORITIES.map((p) => {
                  const isChecked = priorities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePriority(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Custom Priority input */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={customPriority}
                  onChange={(e) => setCustomPriority(e.target.value)}
                  placeholder="Add custom factor (e.g. Commute time, Equity vesting)..."
                  className="flex-1 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPriority(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomPriority}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Personal Constraints / Context */}
            <div>
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                  5
                </span>
                Additional Constraints &amp; Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any personal details that influence this decision: e.g. financial runway, timeline deadline, family obligations, current health/burnout level, or past regrets..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Generates 4 views: Pros &amp; Cons, Comparison Table, SWOT &amp; Final Tiebreaker.
          </p>
          <button
            type="submit"
            disabled={isLoading || !decision.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Weighing Every Angle...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Break The Tie</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
