import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText, Share2 } from 'lucide-react';
import { FullAnalysis } from '../types/decision';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FullAnalysis;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    const { input, tiebreaker, prosCons, swot, decisionType } = analysis;

    return `# The Tiebreaker: Decision Analysis
**Decision Question:** ${input.decision}
**Date:** ${new Date(analysis.createdAt).toLocaleDateString()}
**Decision Framing:** ${decisionType}

---

## 🏆 The Tiebreaker Verdict
**Winning Choice:** ${tiebreaker.winner} (Confidence: ${tiebreaker.confidenceScore}%)
**Headline:** ${tiebreaker.headline}

### Core Rationale
${tiebreaker.coreRationale}

### Key Deciding Factor
${tiebreaker.keyDecidingFactor}

### The Conditional "If-Then" Rule
${tiebreaker.conditionalRule}

---

## ⚖️ Pros & Cons Summary
${prosCons
  .map(
    (opt) => `### ${opt.option}
*${opt.summaryBadge}*

**Pros:**
${opt.pros.map((p) => `- [${p.impact.toUpperCase()}] ${p.text} (+${p.score})`).join('\n')}

**Cons:**
${opt.cons.map((c) => `- [${c.impact.toUpperCase()}] ${c.text} (${c.score})`).join('\n')}
`
  )
  .join('\n\n')}

---

## 🔍 SWOT Analysis Summary
${swot
  .map(
    (s) => `### ${s.option}
- **Strengths:** ${s.strengths.join(', ')}
- **Weaknesses:** ${s.weaknesses.join(', ')}
- **Opportunities:** ${s.opportunities.join(', ')}
- **Threats:** ${s.threats.join(', ')}
- **Strategic Takeaway:** ${s.strategicTakeaway}
`
  )
  .join('\n\n')}

---

## 🚀 72-Hour Action Plan
${tiebreaker.actionPlan
  .map((step) => `1. **[${step.timeframe}]** ${step.action} *(Purpose: ${step.purpose})*`)
  .join('\n')}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Export Decision Executive Summary
            </h3>
            <p className="text-xs text-slate-400">
              Share with colleagues, your partner, or save into your personal notes.
            </p>
          </div>
        </div>

        {/* Markdown preview box */}
        <div className="flex-1 overflow-y-auto my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-all">
          {generateMarkdown()}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print / PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
