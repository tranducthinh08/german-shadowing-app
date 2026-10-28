import React from 'react';
import {
  Zap,
  Check,
  X,
  BookOpen,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export default function DictationFeedbackView({
  isLiveCheck,
  liveStream,
  diffResult,
  onOpenGrammar,
  onAdvance,
  segmentIndex,
  totalSegments,
  isStandardMet
}) {
  return (
    <>
      {/* Live Word-by-Word Validation Stream */}
      {isLiveCheck && liveStream && liveStream.tokens.length > 0 && (
        <div className="p-3 rounded-lg bg-surface-container-lowest/90 border border-outline-variant/30 flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between text-xs text-outline">
            <span className="flex items-center gap-1.5 font-semibold text-secondary">
              <Zap className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>Kiểm tra tức thì:</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={liveStream.matchedCount === liveStream.totalCount ? 'text-emerald-400 font-bold' : 'text-on-surface'}>
                {liveStream.matchedCount} / {liveStream.totalCount} từ đúng
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-bold text-secondary">{liveStream.score}%</span>
            </div>
          </div>

          {/* Live Token Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {liveStream.tokens.map((token, idx) => {
              if (token.status === 'correct') {
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/50 shadow-xs transition-all"
                    title="Đúng"
                  >
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{token.typedWord}</span>
                  </span>
                );
              }

              if (token.status === 'typing') {
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-950/40 text-sky-300 border border-sky-500/50 animate-pulse shadow-xs transition-all"
                    title="Đang gõ..."
                  >
                    <span>{token.typedWord}</span>
                    <span className="text-[10px] text-sky-400 opacity-60">…</span>
                  </span>
                );
              }

              if (token.status === 'typo' || token.status === 'wrong') {
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/50 shadow-xs transition-all"
                    title="Sai"
                  >
                    <X className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{token.typedWord}</span>
                  </span>
                );
              }

              if (token.status === 'extra') {
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/30 text-rose-400 border border-dashed border-rose-500/40"
                    title="Từ thừa"
                  >
                    <X className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{token.typedWord} (thừa)</span>
                  </span>
                );
              }

              // pending token
              return (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md text-xs text-outline/50 bg-surface-container/40 border border-dashed border-outline-variant/30 select-none"
                  title="Từ tiếp theo"
                >
                  •••
                </span>
              );
            })}
          </div>

          {/* Quick mini-progress bar */}
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-300 ${
                liveStream.isComplete ? 'bg-emerald-400' : 'bg-secondary'
              }`}
              style={{ width: `${Math.min(100, liveStream.score)}%` }}
            />
          </div>
        </div>
      )}

      {/* Diff Result Breakdown Card */}
      {diffResult && (
        <div className="p-4 rounded-xl bg-surface-container-high/90 border border-outline-variant/40 shadow-lg flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline font-bold text-xs shadow-xs ${
                diffResult.score >= 90
                  ? 'bg-secondary/20 text-secondary border border-secondary/40'
                  : diffResult.score >= 70
                  ? 'bg-tertiary-container/30 text-tertiary border border-tertiary/40'
                  : 'bg-error/20 text-error border border-error/40'
              }`}>
                {diffResult.score}%
              </div>
              <div>
                <h4 className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                  {diffResult.isPerfect ? 'Hoàn hảo 100%!' : diffResult.score >= 80 ? 'Xuất sắc! Gần đúng tuyệt đối.' : 'Cần chú ý một số từ bên dưới!'}
                </h4>
                <p className="text-[11px] text-outline">
                  {diffResult.score >= 80 ? (
                    `Đúng ${diffResult.correctCount} / ${diffResult.totalCount} từ • Đạt điểm chuẩn`
                  ) : diffResult.typoCount > 0 ? (
                    `${diffResult.correctCount} / ${diffResult.totalCount} từ đúng hoàn chỉnh • ${diffResult.typoCount} từ cần sửa chính tả`
                  ) : (
                    `Đúng ${diffResult.correctCount} / ${diffResult.totalCount} từ • Hãy nghe lại và thử lại`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenGrammar}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-primary border border-outline-variant/30 hover:bg-surface-bright transition-all cursor-pointer"
                title="Xem phân tích ngữ pháp câu này"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Ngữ pháp</span>
              </button>

              {segmentIndex < totalSegments - 1 && (
                <button
                  type="button"
                  onClick={onAdvance}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary-container font-headline font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Nhấn phím Enter hoặc click để sang câu kế"
                >
                  <span>Câu kế</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  {isStandardMet && (
                    <kbd className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">Enter ↵</kbd>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Token-by-Token Match Visualizer (Color-Coded Feedback) */}
          <div className="p-3 rounded-lg bg-surface-container-lowest flex flex-wrap items-center gap-1.5 font-transcription text-xs sm:text-sm border border-outline-variant/20">
            {diffResult.tokens.map((token, idx) => {
              if (token.status === 'correct') {
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary font-semibold border border-secondary/30"
                    title="Chính xác"
                  >
                    {token.word}
                  </span>
                );
              }
              if (token.status === 'typo') {
                return (
                  <span
                    key={idx}
                    className="relative group/tooltip px-2 py-0.5 rounded-md bg-tertiary-container/30 text-tertiary font-bold border border-tertiary/40 flex items-center gap-1 cursor-help"
                  >
                    <span className="line-through opacity-70">{token.userInput}</span>
                    <span>➔ {token.word}</span>
                    <AlertTriangle className="w-3 h-3 text-tertiary" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/tooltip:block px-2 py-1 rounded-md bg-surface-container-highest text-on-surface text-[11px] whitespace-nowrap shadow-xl border border-outline-variant/40 z-20">
                      {token.note || 'Lưu ý chính tả hoặc quy tắc viết hoa danh từ!'}
                    </span>
                  </span>
                );
              }
              if (token.status === 'missing') {
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-error/20 text-error font-medium border border-error/30"
                    title="Từ bị bỏ sót"
                  >
                    [{token.word}]
                  </span>
                );
              }
              if (token.status === 'extra') {
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-surface-container text-outline line-through border border-outline-variant/30"
                    title="Từ gõ thừa"
                  >
                    {token.userInput}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </>
  );
}
