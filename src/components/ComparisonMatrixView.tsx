import React, { useState } from 'react';
import {
  Table,
  Sliders,
  Plus,
  Trophy,
  Award,
  Info,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { MatrixCriterion, OptionMatrix } from '../types/decision';
import { calculateMatrixTotals } from '../utils/scoring';

interface ComparisonMatrixViewProps {
  matrix: {
    criteria: MatrixCriterion[];
    optionScores: OptionMatrix[];
  };
  onUpdateMatrix: (updated: {
    criteria: MatrixCriterion[];
    optionScores: OptionMatrix[];
  }) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  matrix,
  onUpdateMatrix,
}) => {
  const { criteria, optionScores } = matrix;
  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionDesc, setNewCriterionDesc] = useState('');
  const [newCriterionWeight, setNewCriterionWeight] = useState(4);
  const [newScores, setNewScores] = useState<Record<string, number>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Calculate live weighted scores and ranks
  const results = calculateMatrixTotals(criteria, optionScores);
  const winner = results[0];

  const handleWeightChange = (criterionId: string, newWeight: number) => {
    const updatedCriteria = criteria.map((c) =>
      c.id === criterionId ? { ...c, userWeight: newWeight } : c
    );
    onUpdateMatrix({
      criteria: updatedCriteria,
      optionScores,
    });
  };

  const handleScoreChange = (optionName: string, criterionId: string, score: number) => {
    const updatedOptionScores = optionScores.map((opt) => {
      if (opt.option === optionName) {
        const scoreIndex = opt.scores.findIndex((s) => s.criteriaId === criterionId);
        const updatedScores = [...opt.scores];
        if (scoreIndex > -1) {
          updatedScores[scoreIndex] = { ...updatedScores[scoreIndex], score };
        } else {
          updatedScores.push({ criteriaId: criterionId, score, rationale: 'User adjusted score' });
        }
        return { ...opt, scores: updatedScores };
      }
      return opt;
    });

    onUpdateMatrix({
      criteria,
      optionScores: updatedOptionScores,
    });
  };

  const handleAddCriterionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionName.trim()) return;

    const newId = `crit-${Date.now()}`;
    const newCrit: MatrixCriterion = {
      id: newId,
      name: newCriterionName.trim(),
      description: newCriterionDesc.trim() || 'Custom user dimension',
      defaultWeight: newCriterionWeight,
      userWeight: newCriterionWeight,
    };

    const updatedOptionScores = optionScores.map((opt) => {
      const score = newScores[opt.option] || 5;
      return {
        ...opt,
        scores: [
          ...opt.scores,
          {
            criteriaId: newId,
            score,
            rationale: 'Custom user rating',
          },
        ],
      };
    });

    onUpdateMatrix({
      criteria: [...criteria, newCrit],
      optionScores: updatedOptionScores,
    });

    setNewCriterionName('');
    setNewCriterionDesc('');
    setNewScores({});
    setShowAddCriterion(false);
  };

  const handleDeleteCriterion = (criterionId: string) => {
    if (criteria.length <= 2) return;
    const updatedCriteria = criteria.filter((c) => c.id !== criterionId);
    const updatedOptionScores = optionScores.map((opt) => ({
      ...opt,
      scores: opt.scores.filter((s) => s.criteriaId !== criterionId),
    }));
    onUpdateMatrix({
      criteria: updatedCriteria,
      optionScores: updatedOptionScores,
    });
  };

  return (
    <div className="space-y-6">
      {/* Weighted Rankings Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Live Weighted Leaderboard
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Drag the criteria weights below to see how shifts in your personal priorities instantly change the winner.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCriterion(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>Add Custom Metric</span>
          </button>
        </div>

        {/* Option Podium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {results.map((res) => {
            const isWinner = res.rank === 1;
            return (
              <div
                key={res.option}
                className={`p-4 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isWinner
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : res.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : 'bg-amber-700/60 text-amber-100'
                      }`}
                    >
                      #{res.rank}
                    </span>
                    <span className="text-sm font-bold text-slate-100 truncate max-w-[160px]">
                      {res.option}
                    </span>
                  </div>
                  {isWinner && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Top Pick
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Weighted Match:</span>
                    <span className="font-bold text-slate-200">{res.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isWinner
                          ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${res.percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    {res.totalScore} / {res.maxPossibleScore} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Comparison Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm sm:text-base font-bold text-slate-100">
              Side-by-Side Dimension Scores (1-10 Scale)
            </h4>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Higher score = more advantageous
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-300">
                <th className="py-3.5 px-4 min-w-[220px]">Evaluation Criterion</th>
                <th className="py-3.5 px-3 min-w-[140px] text-center">
                  Importance Weight
                </th>
                {optionScores.map((opt, i) => (
                  <th key={opt.option} className="py-3.5 px-4 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="truncate">{opt.option}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {criteria.map((c) => {
                const currentWeight = c.userWeight ?? c.defaultWeight ?? 3;
                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Criterion Name & Description */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-100 text-sm mb-0.5">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug">
                            {c.description}
                          </div>
                        </div>
                        {criteria.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCriterion(c.id)}
                            className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
                            title="Delete this criterion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Weight Slider */}
                    <td className="py-4 px-3 align-top text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => handleWeightChange(c.id, w)}
                              className={`w-5 h-5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                currentWeight >= w
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {currentWeight === 5
                            ? 'Top Priority'
                            : currentWeight >= 4
                            ? 'High Priority'
                            : currentWeight === 3
                            ? 'Medium'
                            : 'Low Weight'}
                        </span>
                      </div>
                    </td>

                    {/* Option Scores */}
                    {optionScores.map((opt) => {
                      const scoreObj = opt.scores.find((s) => s.criteriaId === c.id);
                      const scoreVal = scoreObj ? scoreObj.score : 5;
                      const rationale = scoreObj?.rationale || 'Balanced baseline.';

                      return (
                        <td key={opt.option} className="py-4 px-4 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-black px-2 py-0.5 rounded ${
                                  scoreVal >= 8
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : scoreVal >= 6
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {scoreVal}/10
                              </span>

                              {/* Quick increment/decrement buttons */}
                              <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleScoreChange(
                                      opt.option,
                                      c.id,
                                      Math.max(1, scoreVal - 1)
                                    )
                                  }
                                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-[10px]"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleScoreChange(
                                      opt.option,
                                      c.id,
                                      Math.min(10, scoreVal + 1)
                                    )
                                  }
                                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-[10px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-snug">
                              {rationale}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Criterion Modal */}
      {showAddCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">
              Add Custom Evaluation Criterion
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Rate every option on a factor unique to your situation (e.g. partner happiness, commute, or alignment with your 5-year goal).
            </p>

            <form onSubmit={handleAddCriterionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Criterion Name
                </label>
                <input
                  type="text"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  placeholder="e.g. Spouse / Family Support"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description / Context
                </label>
                <input
                  type="text"
                  value={newCriterionDesc}
                  onChange={(e) => setNewCriterionDesc(e.target.value)}
                  placeholder="e.g. How enthusiastic is my family about this move?"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Importance Weight (1 to 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setNewCriterionWeight(w)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        newCriterionWeight === w
                          ? 'bg-amber-400 border-amber-400 text-slate-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {w}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial ratings for each option */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Rate each option on this dimension (1-10):
                </label>
                <div className="space-y-2">
                  {optionScores.map((opt) => (
                    <div key={opt.option} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-300 truncate max-w-[200px]">{opt.option}:</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newScores[opt.option] ?? 7}
                        onChange={(e) =>
                          setNewScores({
                            ...newScores,
                            [opt.option]: parseInt(e.target.value, 10) || 5,
                          })
                        }
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCriterion(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md"
                >
                  Add Dimension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
