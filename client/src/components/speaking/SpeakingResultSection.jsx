import React from 'react';
import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';

export default function SpeakingResultSection({
  diagnosticResult,
  onSelectWord,
  onRetry,
  onNextSentence
}) {
  if (!diagnosticResult) return null;

  const { score, generalTip, words = [], alerts = [] } = diagnosticResult;

  const scoreBadgeStyle = score >= 90
    ? 'bg-secondary/20 text-secondary border-secondary/40'
    : score >= 75
    ? 'bg-tertiary/20 text-tertiary border-tertiary/40'
    : 'bg-error/20 text-error border-error/40';

  const scoreHeading = score >= 90
    ? 'Phát âm tuyệt vời!'
    : score >= 75
    ? 'Khá tốt!'
    : 'Cần chú ý khẩu hình';

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container border border-outline-variant/40 animate-in fade-in duration-200">
      {/* Score banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base border shadow-xs ${scoreBadgeStyle}`}>
            {score}%
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">
              {scoreHeading}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              {generalTip}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Luyện lại</span>
          </button>
          <button
            type="button"
            onClick={onNextSentence}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <span>Câu tiếp theo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Word-by-word visual grading */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
          Chấm điểm từng từ (Nhấn vào từ để xem hướng dẫn khẩu hình):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {words.map((w, idx) => {
            const wordStyle = w.status === 'correct'
              ? 'bg-secondary/15 text-secondary border-secondary/30 hover:bg-secondary/25'
              : w.status === 'partial'
              ? 'bg-tertiary/15 text-tertiary border-tertiary/30 hover:bg-tertiary/25 animate-pulse'
              : 'bg-error/15 text-error border-error/30 hover:bg-error/25';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectWord(w)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${wordStyle}`}
                title={w.feedback}
              >
                <span>{w.original}</span>
                {w.status === 'partial' && <span>⚠️</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phonetic Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
          <span className="text-[11px] font-bold text-tertiary flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Lưu ý phát âm tiếng Đức phát hiện được:</span>
          </span>
          <div className="flex flex-col gap-1.5">
            {alerts.map((alt, aIdx) => (
              <div key={aIdx} className="p-2.5 rounded-xl bg-tertiary/10 border border-tertiary/25 text-xs text-on-surface">
                {alt.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
