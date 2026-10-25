import React, { useEffect } from 'react';
import { Sparkles, Trophy, Flame, Target } from 'lucide-react';

export default function RewardToast({ reward, onDismiss }) {
  useEffect(() => {
    if (!reward) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);
    return () => clearTimeout(timer);
  }, [reward, onDismiss]);

  if (!reward) return null;

  return (
    <div className="fixed top-20 right-5 z-50 animate-bounce shadow-2xl flex items-center gap-3 px-4 py-3 bg-slate-900/95 border border-amber-500/50 rounded-2xl backdrop-blur-md text-xs text-slate-100 max-w-sm ring-1 ring-amber-500/30">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-lg text-white shrink-0 shadow-md">
        {reward.icon || '🎉'}
      </div>
      <div>
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <span>{reward.title || 'Phần thưởng học tập!'}</span>
          {reward.xpGained && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              +{reward.xpGained} XP
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
          {reward.message}
        </p>
      </div>
    </div>
  );
}
