import React from 'react';
import { X, History, Trash2, ArrowRight, Trophy, Calendar, Sparkles } from 'lucide-react';
import { FullAnalysis } from '../types/decision';

interface SavedDecisionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: FullAnalysis[];
  onSelectDecision: (analysis: FullAnalysis) => void;
  onDeleteDecision: (id: string) => void;
  onClearAll: () => void;
}

export const SavedDecisionsDrawer: React.FC<SavedDecisionsDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Decision History</h3>
              <p className="text-xs text-slate-400">
                {savedDecisions.length} decision{savedDecisions.length === 1 ? '' : 's'} archived
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-medium text-slate-400">No decisions saved yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Your analyzed decisions and custom weighted scores are automatically saved here.
              </p>
            </div>
          ) : (
            savedDecisions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2">
                    {item.input.decision}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDecision(item.id);
                    }}
                    className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete saved decision"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mb-2">
                  <Trophy className="w-3 h-3" />
                  <span>Pick: {item.tiebreaker.winner}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  <button
                    onClick={() => {
                      onSelectDecision(item);
                      onClose();
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedDecisions.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
