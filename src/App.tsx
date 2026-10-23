import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { TiebreakerVerdictCard } from './components/TiebreakerVerdictCard';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonMatrixView } from './components/ComparisonMatrixView';
import { SWOTView } from './components/SWOTView';
import { GutCheckCoinFlipModal } from './components/GutCheckCoinFlipModal';
import { SavedDecisionsDrawer } from './components/SavedDecisionsDrawer';
import { ExportShareModal } from './components/ExportShareModal';
import {
  DecisionInput,
  FullAnalysis,
  OptionProCon,
  MatrixCriterion,
  OptionMatrix,
} from './types/decision';
import {
  Trophy,
  Scale,
  Table,
  Compass,
  Share2,
  Coins,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  Flame
} from 'lucide-react';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions_v1';

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<FullAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'verdict' | 'prosCons' | 'matrix' | 'swot'>('verdict');
  const [savedDecisions, setSavedDecisions] = useState<FullAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCoinFlipOpen, setIsCoinFlipOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load saved history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDecisions(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Save history helper
  const saveAnalysisToHistory = (analysis: FullAnalysis) => {
    setSavedDecisions((prev) => {
      const filtered = prev.filter((item) => item.id !== analysis.id);
      const updated = [analysis, ...filtered].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist history:', err);
      }
      return updated;
    });
  };

  const handleDeleteDecision = (id: string) => {
    setSavedDecisions((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved decision analyses?')) {
      setSavedDecisions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSubmitDecision = async (input: DecisionInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error analyzing decision.');
      }

      const result = await response.json();
      const newAnalysis: FullAnalysis = {
        ...result,
        id: `analysis-${Date.now()}`,
        createdAt: new Date().toISOString(),
        input,
      };

      setCurrentAnalysis(newAnalysis);
      setActiveTab('verdict');
      saveAnalysisToHistory(newAnalysis);

      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting decision:', err);
      setError(err.message || 'Something went wrong while analyzing the decision.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProsCons = (updated: OptionProCon[]) => {
    if (!currentAnalysis) return;
    const updatedAnalysis: FullAnalysis = {
      ...currentAnalysis,
      prosCons: updated,
    };
    setCurrentAnalysis(updatedAnalysis);
    saveAnalysisToHistory(updatedAnalysis);
  };

  const handleUpdateMatrix = (updatedMatrix: {
    criteria: MatrixCriterion[];
    optionScores: OptionMatrix[];
  }) => {
    if (!currentAnalysis) return;
    const updatedAnalysis: FullAnalysis = {
      ...currentAnalysis,
      matrix: updatedMatrix,
    };
    setCurrentAnalysis(updatedAnalysis);
    saveAnalysisToHistory(updatedAnalysis);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        onNewDecision={() => {
          setCurrentAnalysis(null);
          setError(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCoinFlip={() => setIsCoinFlipOpen(true)}
        savedCount={savedDecisions.length}
        hasActiveAnalysis={!!currentAnalysis}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Error notification banner */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 pt-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-white font-bold ml-3"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* State 1: Input / Form */}
        {!currentAnalysis ? (
          <DecisionForm
            onSubmit={handleSubmitDecision}
            isLoading={isLoading}
          />
        ) : (
          /* State 2: Active Analysis Dashboard */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
            {/* Top Navigation & Context Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setCurrentAnalysis(null)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                    title="Back to dilemma input"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Active Dilemma
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        Risk Profile:{' '}
                        <span className="text-slate-200 capitalize font-medium">
                          {currentAnalysis.input.riskTolerance}
                        </span>
                      </span>
                    </div>

                    <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug">
                      {currentAnalysis.input.decision}
                    </h1>
                  </div>
                </div>

                {/* Secondary Quick Action Buttons */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => setIsCoinFlipOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gut Check</span>
                  </button>

                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export / Share</span>
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
                {[
                  {
                    id: 'verdict',
                    label: 'The Tiebreaker Pick',
                    icon: Trophy,
                    desc: 'Final verdict & blindspots',
                    activeColor: 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20',
                  },
                  {
                    id: 'prosCons',
                    label: 'Pros & Cons',
                    icon: Scale,
                    desc: 'Weighted side-by-side lists',
                    activeColor: 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20',
                  },
                  {
                    id: 'matrix',
                    label: 'Comparison Table',
                    icon: Table,
                    desc: 'Multi-criteria decision matrix',
                    activeColor: 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-600/20',
                  },
                  {
                    id: 'swot',
                    label: 'SWOT Analysis',
                    icon: Compass,
                    desc: 'Strengths, threats & strategy',
                    activeColor: 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20',
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer border ${
                        isActive
                          ? `${tab.activeColor} border-transparent ring-1 ring-white/20`
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-inherit' : 'text-slate-400'}`} />
                        <span className="text-xs sm:text-sm font-semibold truncate">
                          {tab.label}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate hidden sm:block ${isActive ? 'opacity-90' : 'text-slate-500'}`}>
                        {tab.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab View Rendering */}
            <div className="animate-in fade-in duration-200">
              {activeTab === 'verdict' && (
                <TiebreakerVerdictCard analysis={currentAnalysis} />
              )}
              {activeTab === 'prosCons' && (
                <ProsConsView
                  prosCons={currentAnalysis.prosCons}
                  onUpdateProsCons={handleUpdateProsCons}
                />
              )}
              {activeTab === 'matrix' && (
                <ComparisonMatrixView
                  matrix={currentAnalysis.matrix}
                  onUpdateMatrix={handleUpdateMatrix}
                />
              )}
              {activeTab === 'swot' && (
                <SWOTView swot={currentAnalysis.swot} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* History Drawer */}
      <SavedDecisionsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(item) => {
          setCurrentAnalysis(item);
          setActiveTab('verdict');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteDecision={handleDeleteDecision}
        onClearAll={handleClearAllHistory}
      />

      {/* Gut-Check Coin Flip Modal */}
      <GutCheckCoinFlipModal
        isOpen={isCoinFlipOpen}
        onClose={() => setIsCoinFlipOpen(false)}
        options={
          currentAnalysis?.input.options || ['Option A', 'Option B']
        }
      />

      {/* Export / Share Modal */}
      {currentAnalysis && (
        <ExportShareModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={currentAnalysis}
        />
      )}
    </div>
  );
}
