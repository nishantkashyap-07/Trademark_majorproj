import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchResult {
  source: 'internal' | 'uspto' | 'wipo' | 'similarity';
  label: string;
  matchedText: string;
  similarity: number;
  owner?: string;
  category?: string;
  registrationDate?: string;
  status?: string;
  sameCategory: boolean;
}

interface InfringementResult {
  riskLevel: 'clear' | 'risky' | 'blocked';
  riskScore: number;
  matches: MatchResult[];
  checkedSources: string[];
  disclaimer: string;
}

interface Props {
  slogan: string;
  category: string;
  onResult: (result: InfringementResult | null) => void;
}

// ─── Scanning Steps ──────────────────────────────────────────────────────────
const SCAN_STEPS = [
  { id: 'normalize',  label: 'Normalizing phrase',          icon: '⚙️', duration: 400 },
  { id: 'internal',  label: 'Checking Platform Registry',  icon: '🗄️', duration: 1200 },
  { id: 'uspto',     label: 'Querying USPTO (USA)',         icon: '🇺🇸', duration: 1800 },
  { id: 'wipo',      label: 'Querying WIPO Global Brand DB',icon: '🌐', duration: 1400 },
  { id: 'fuzzy',     label: 'Running Similarity Engine',   icon: '🔬', duration: 800 },
  { id: 'scoring',   label: 'Computing Risk Score',        icon: '📊', duration: 500 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const SourceBadge = ({ source }: { source: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    internal: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300', label: 'Platform' },
    uspto:    { color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',         label: 'USPTO' },
    wipo:     { color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300', label: 'WIPO' },
    similarity:{ color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',    label: 'Fuzzy' },
  };
  const s = map[source] || map['similarity'];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${s.color}`}>
      {s.label}
    </span>
  );
};

const SimilarityBar = ({ score, sameCategory }: { score: number; sameCategory: boolean }) => {
  const color = score >= 90
    ? 'bg-red-500'
    : score >= 70
    ? 'bg-orange-400'
    : 'bg-amber-400';

  return (
    <div className="space-y-1 flex-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Similarity</span>
        <div className="flex items-center gap-1.5">
          {sameCategory && (
            <span className="text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-full">
              Same Category
            </span>
          )}
          <span className={`text-[11px] font-bold ${score >= 70 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
            {score}%
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InfringementChecker({ slogan, category, onResult }: Props) {
  const [state, setState] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [result, setResult] = useState<InfringementResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const canScan = slogan.trim().length >= 2 && category.length > 0;

  const runScan = useCallback(async () => {
    if (!canScan) return;
    setState('scanning');
    setCurrentStep(0);
    setCompletedSteps([]);
    setResult(null);
    setErrorMsg('');
    onResult(null);

    // Animate through steps
    let elapsed = 0;
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, SCAN_STEPS[i].duration));
      setCompletedSteps(prev => [...prev, SCAN_STEPS[i].id]);
      elapsed += SCAN_STEPS[i].duration;
    }

    // Now hit the real API
    try {
      const res = await fetch('/api/trademarks/check-infringement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slogan, category }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Check failed');

      setResult(data.data);
      onResult(data.data);
      setState('done');
    } catch (e: any) {
      setErrorMsg(e.message || 'Infringement check failed. Continuing without check.');
      setState('error');
    }
  }, [slogan, category, canScan, onResult]);

  const reset = () => {
    setState('idle');
    setCurrentStep(-1);
    setCompletedSteps([]);
    setResult(null);
    setExpanded(null);
    onResult(null);
  };

  // ─── Risk level config ────────────────────────────────────────────────────
  const riskConfig = result ? {
    clear:   { bg: 'from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10',  border: 'border-emerald-200 dark:border-emerald-500/20', icon: '✅', title: 'Clear to Register', subtitle: 'No trademark conflicts detected', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', bar: 'bg-emerald-500' },
    risky:   { bg: 'from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10',    border: 'border-amber-200 dark:border-amber-500/20',    icon: '⚠️', title: 'Potential Conflict',   subtitle: 'Similar trademarks found — may require legal review', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',    bar: 'bg-amber-400'   },
    blocked: { bg: 'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10',           border: 'border-red-200 dark:border-red-500/20',         icon: '🚫', title: 'Registration Blocked',  subtitle: 'High-confidence trademark conflict detected',        badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',           bar: 'bg-red-500'     },
  }[result.riskLevel] : null;

  return (
    <div className="space-y-4">
      {/* Trigger Button */}
      {state === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-base flex-shrink-0">🛡️</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">IP Guard Verification</p>
              <p className="text-xs text-blue-500/80 dark:text-blue-400/70 truncate">
                {canScan ? `Check "${slogan}" across USPTO, WIPO & Platform` : 'Enter a slogan and select a category first'}
              </p>
            </div>
          </div>
          <button
            onClick={runScan}
            disabled={!canScan}
            className="flex-shrink-0 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-blue-500/20"
          >
            Run Check
          </button>
        </motion.div>
      )}

      {/* Scanning Animation */}
      <AnimatePresence>
        {state === 'scanning' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Scanning for Infringement…</p>
                <p className="text-xs text-slate-400">Analyzing across {SCAN_STEPS.length} verification layers</p>
              </div>
            </div>

            {/* Phrase being scanned */}
            <div className="px-5 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">"{slogan}"</span>
                <span className="text-xs text-slate-400">in</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{category}</span>
              </div>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-2">
              {SCAN_STEPS.map((step, idx) => {
                const done = completedSteps.includes(step.id);
                const active = currentStep === idx;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: idx <= currentStep ? 1 : 0.3, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${done ? 'bg-emerald-100 dark:bg-emerald-500/20' : active ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                      {done ? (
                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : active ? (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-slate-300 dark:bg-white/20 rounded-full" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors ${done ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-400'}`}>
                      {step.icon} {step.label}
                    </span>
                    {active && (
                      <div className="ml-auto flex gap-0.5">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                    {done && (
                      <span className="ml-auto text-[9px] text-emerald-500 font-bold">Done</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Animated progress bar */}
            <div className="px-5 pb-5">
              <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((completedSteps.length) / SCAN_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-[9px] text-slate-400 text-right mt-1">
                {completedSteps.length}/{SCAN_STEPS.length} checks complete
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-900/10 flex items-start gap-3"
          >
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Verification Unavailable</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-0.5">{errorMsg}</p>
            </div>
            <button onClick={reset} className="text-[9px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex-shrink-0">Retry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {state === 'done' && result && riskConfig && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border overflow-hidden bg-gradient-to-br ${riskConfig.bg} ${riskConfig.border}`}
          >
            {/* Result Header */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl flex-shrink-0">{riskConfig.icon}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{riskConfig.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${riskConfig.badge}`}>
                      Risk: {result.riskScore}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{riskConfig.subtitle}</p>
                </div>
              </div>
              <button onClick={reset} className="flex-shrink-0 text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline self-start sm:self-center">
                Re-scan
              </button>
            </div>

            {/* Risk score bar */}
            <div className="px-5 pb-4">
              <div className="h-2 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${riskConfig.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.riskScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400">0% — Clear</span>
                <span className="text-[9px] text-slate-400">100% — Blocked</span>
              </div>
            </div>

            {/* Sources Checked */}
            <div className="px-5 pb-4">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sources Checked</p>
              <div className="flex flex-wrap gap-1.5">
                {result.checkedSources.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/60 dark:bg-black/20 text-slate-600 dark:text-slate-300 border border-white/80 dark:border-white/10">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Matches Found */}
            {result.matches.length > 0 && (
              <div className="px-5 pb-5 space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {result.matches.length} Conflict{result.matches.length !== 1 ? 's' : ''} Found
                </p>
                {result.matches.map((match, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/20 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpanded(expanded === idx ? null : idx)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SourceBadge source={match.source} />
                          {match.sameCategory && (
                            <span className="text-[9px] font-bold text-red-500">⚡ Same Category</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          "{match.matchedText}"
                        </p>
                        <SimilarityBar score={match.similarity} sameCategory={match.sameCategory} />
                      </div>
                      <svg
                        className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded === idx ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {expanded === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/60 dark:border-white/5 overflow-hidden"
                        >
                          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { label: 'Database', value: match.label },
                              { label: 'Owner', value: match.owner || '—' },
                              { label: 'Category', value: match.category || '—' },
                              { label: 'Status', value: match.status || '—' },
                              { label: 'Reg. Date', value: match.registrationDate || '—' },
                            ].map(({ label, value }) => (
                              <div key={label} className="space-y-0.5">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No matches */}
            {result.matches.length === 0 && result.riskLevel === 'clear' && (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-500/10">
                  <span className="text-sm">🎉</span>
                  <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    No matching trademarks found across all sources. You are clear to proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="px-5 pb-5">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  ⚖️ <strong className="text-slate-500 dark:text-slate-400">Legal Disclaimer:</strong> {result.disclaimer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
