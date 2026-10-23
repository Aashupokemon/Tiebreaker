import React, { useState } from 'react';
import { X, Coins, Sparkles, Heart, Brain, RefreshCw } from 'lucide-react';

interface GutCheckCoinFlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
}

export const GutCheckCoinFlipModal: React.FC<GutCheckCoinFlipModalProps> = ({
  isOpen,
  onClose,
  options,
}) => {
  const optA = options[0] || 'Option A';
  const optB = options[1] || 'Option B';

  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'A' | 'B' | null>(null);
  const [gutFeedback, setGutFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFlip = () => {
    setIsFlipping(true);
    setResult(null);
    setGutFeedback(null);

    // Randomize 50/50
    const pick = Math.random() > 0.5 ? 'A' : 'B';

    setTimeout(() => {
      setResult(pick);
      setIsFlipping(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
          <Coins className="w-6 h-6 text-slate-950" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          The Freud Gut-Check Flip
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          The goal isn&apos;t to let fate decide—it&apos;s to notice how your heart reacts while the coin is in mid-air.
        </p>

        {/* Option Mapping */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
              HEADS (Option A)
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {optA}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
              TAILS (Option B)
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {optB}
            </div>
          </div>
        </div>

        {/* Coin Display */}
        <div className="my-8 flex justify-center">
          <div
            className={`w-28 h-28 rounded-full border-4 border-amber-400/80 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-xl shadow-amber-500/20 text-slate-950 font-black text-2xl transition-transform ${
              isFlipping ? 'animate-bounce scale-110' : 'hover:scale-105'
            }`}
          >
            {isFlipping ? (
              <RefreshCw className="w-10 h-10 animate-spin text-slate-900" />
            ) : result ? (
              <span>{result === 'A' ? 'HEADS' : 'TAILS'}</span>
            ) : (
              <Coins className="w-10 h-10 text-slate-900" />
            )}
          </div>
        </div>

        {/* Flip action button */}
        {!result && !isFlipping && (
          <button
            onClick={handleFlip}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Toss The Coin
          </button>
        )}

        {/* Reveal & Gut Prompt */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/30">
              <div className="text-xs text-slate-400">The coin landed on:</div>
              <div className="text-base font-bold text-amber-300 mt-0.5">
                {result === 'A' ? optA : optB}
              </div>
            </div>

            {!gutFeedback ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Be honest: In that exact split-second it landed, what did your body feel?
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setGutFeedback(
                        `Relief! Your subconscious was secretly rooting for "${
                          result === 'A' ? optA : optB
                        }". Trust that instinct.`
                      )
                    }
                    className="p-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
                  >
                    😌 Relief / Satisfaction
                  </button>
                  <button
                    onClick={() =>
                      setGutFeedback(
                        `A twinge of disappointment! That means your gut actually wants "${
                          result === 'A' ? optB : optA
                        }". The coin just revealed your true desire!`
                      )
                    }
                    className="p-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
                  >
                    😟 Slight Disappointment
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Your Gut Verdict:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {gutFeedback}
                </p>
                <div className="pt-2 text-right">
                  <button
                    onClick={handleFlip}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Flip again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
