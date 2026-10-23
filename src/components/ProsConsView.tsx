import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Plus,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Tag,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { OptionProCon, ProConItem, ImpactLevel } from '../types/decision';
import { calculateProConNetScore } from '../utils/scoring';

interface ProsConsViewProps {
  prosCons: OptionProCon[];
  onUpdateProsCons: (updated: OptionProCon[]) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  prosCons,
  onUpdateProsCons,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState<string | null>(null); // option name or null
  const [newType, setNewType] = useState<'pro' | 'con'>('pro');
  const [newText, setNewText] = useState('');
  const [newImpact, setNewImpact] = useState<ImpactLevel>('high');
  const [newCategory, setNewCategory] = useState('Personal');

  // Multi-option view: either all side-by-side (if 2 options) or tabbed (if > 2)
  const isBinary = prosCons.length === 2;

  const handleAdjustWeight = (
    optionIdx: number,
    listType: 'pros' | 'cons',
    itemId: string,
    delta: number
  ) => {
    const updated = [...prosCons];
    const targetList = updated[optionIdx][listType];
    const itemIndex = targetList.findIndex((item) => item.id === itemId);
    if (itemIndex > -1) {
      const current = targetList[itemIndex].userWeight ?? 1;
      const nextWeight = Math.max(0.5, Math.min(3, current + delta));
      targetList[itemIndex] = {
        ...targetList[itemIndex],
        userWeight: Math.round(nextWeight * 10) / 10,
      };
      onUpdateProsCons(updated);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent, optionName: string) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const updated = prosCons.map((opt) => {
      if (opt.option === optionName) {
        const newItem: ProConItem = {
          id: `custom-${Date.now()}`,
          text: newText.trim(),
          impact: newImpact,
          score: newType === 'pro'
            ? newImpact === 'critical' ? 10 : newImpact === 'high' ? 8 : newImpact === 'medium' ? 5 : 3
            : newImpact === 'critical' ? -10 : newImpact === 'high' ? -8 : newImpact === 'medium' ? -5 : -3,
          category: newCategory.trim() || 'Custom',
          userWeight: 1,
          isCustom: true,
        };

        return {
          ...opt,
          [newType === 'pro' ? 'pros' : 'cons']: [
            ...opt[newType === 'pro' ? 'pros' : 'cons'],
            newItem,
          ],
        };
      }
      return opt;
    });

    onUpdateProsCons(updated);
    setNewText('');
    setShowAddModal(null);
  };

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'critical':
        return (
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Option Selector Tabs if > 2 options or toggler */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {prosCons.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const scoreData = calculateProConNetScore(opt);
            return (
              <button
                key={opt.option}
                type="button"
                onClick={() => setSelectedOptionIndex(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span>{opt.option}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950'
                      : scoreData.netScore >= 0
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {scoreData.netScore > 0 ? `+${scoreData.netScore}` : scoreData.netScore}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 px-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>Click weights to fine-tune your priorities</span>
        </div>
      </div>

      {/* Render Selected Option Breakdown */}
      {(() => {
        const opt = prosCons[selectedOptionIndex];
        if (!opt) return null;
        const scoreData = calculateProConNetScore(opt);

        return (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
            {/* Header of selected option */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                    {String.fromCharCode(65 + selectedOptionIndex)}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {opt.option}
                  </h3>
                </div>
                <p className="text-xs text-amber-300/80 font-medium">
                  {opt.summaryBadge}
                </p>
              </div>

              {/* Net Score Card */}
              <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Net Decision Score
                  </div>
                  <div
                    className={`text-xl font-black ${
                      scoreData.netScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {scoreData.netScore > 0 ? `+${scoreData.netScore}` : scoreData.netScore}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-l border-slate-800 pl-3">
                  <div>
                    Pros: <span className="text-emerald-400 font-semibold">+{scoreData.prosSum}</span>
                  </div>
                  <div>
                    Cons: <span className="text-rose-400 font-semibold">-{scoreData.consSum}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pros and Cons Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Pros List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Pros &amp; Upsides ({opt.pros.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewType('pro');
                      setShowAddModal(opt.option);
                    }}
                    className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Pro</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {opt.pros.map((item) => {
                    const weight = item.userWeight ?? 1;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                            {item.text}
                          </p>
                          <div className="flex-shrink-0">
                            {getImpactBadge(item.impact)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Tag className="w-3 h-3 text-emerald-400/80" />
                            {item.category}
                          </span>

                          {/* Weight fine-tuner */}
                          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400">Weight:</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(selectedOptionIndex, 'pros', item.id, -0.5)}
                              className="w-4 h-4 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold"
                              title="Decrease importance"
                            >
                              -
                            </button>
                            <span className="font-bold text-amber-300 text-xs px-0.5">
                              {weight}x
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(selectedOptionIndex, 'pros', item.id, 0.5)}
                              className="w-4 h-4 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold"
                              title="Increase importance"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cons List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>Cons &amp; Downsides ({opt.cons.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewType('con');
                      setShowAddModal(opt.option);
                    }}
                    className="text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Con</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {opt.cons.map((item) => {
                    const weight = item.userWeight ?? 1;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                            {item.text}
                          </p>
                          <div className="flex-shrink-0">
                            {getImpactBadge(item.impact)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Tag className="w-3 h-3 text-rose-400/80" />
                            {item.category}
                          </span>

                          {/* Weight fine-tuner */}
                          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400">Weight:</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(selectedOptionIndex, 'cons', item.id, -0.5)}
                              className="w-4 h-4 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold"
                              title="Decrease importance"
                            >
                              -
                            </button>
                            <span className="font-bold text-amber-300 text-xs px-0.5">
                              {weight}x
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(selectedOptionIndex, 'cons', item.id, 0.5)}
                              className="w-4 h-4 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold"
                              title="Increase importance"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick compare preview of other options */}
            {prosCons.length > 1 && (
              <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  Comparing all options:{' '}
                  {prosCons.map((p, i) => (
                    <span key={p.option} className="mr-3 font-medium text-slate-300">
                      {p.option} (
                      <span className={calculateProConNetScore(p).netScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {calculateProConNetScore(p).netScore > 0 ? '+' : ''}{calculateProConNetScore(p).netScore}
                      </span>
                      )
                    </span>
                  ))}
                </span>
                <span className="text-amber-400/80">Switch tabs above to examine any alternative</span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Add Pro or Con Modal / Sheet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">
              Add Personal {newType === 'pro' ? 'Pro' : 'Con'} to {showAddModal}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Add a personal consideration or factor that the AI might have missed.
            </p>

            <form onSubmit={(e) => handleAddCustomItem(e, showAddModal)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('pro')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      newType === 'pro'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    + Advantage (Pro)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('con')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      newType === 'con'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    - Disadvantage (Con)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. My partner strongly prefers living closer to family"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Impact Level
                  </label>
                  <select
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value as ImpactLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="critical">Critical (Make or Break)</option>
                    <option value="high">High Impact</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low Impact</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Family, Cost, Health"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  >
                  </input>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md"
                >
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
