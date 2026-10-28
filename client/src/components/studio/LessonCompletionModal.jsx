import React, { useEffect } from 'react';
import { Trophy, Sparkles, ArrowRight, RotateCcw, BookOpen, CheckCircle2, X } from 'lucide-react';

export default function LessonCompletionModal({
  isOpen,
  onClose,
  lessonData,
  onNextLesson,
  onReplayLesson,
  onOpenLessons
}) {
  if (!isOpen || !lessonData) return null;

  const { video, nextEpisode } = lessonData;
  const sentenceCount = video?.sentences?.length || 0;

  // Global keydown: Enter to advance to next episode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (nextEpisode && onNextLesson) {
          onNextLesson();
        } else if (onClose) {
          onClose();
        }
      } else if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEpisode, onNextLesson, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl p-6 sm:p-7 space-y-5 my-auto text-center transition-all animate-scale-up">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Header Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-primary/20 to-secondary/30 flex items-center justify-center border border-amber-400/40 shadow-lg shadow-amber-500/10">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-xs">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        {/* Title and Congratulations */}
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-xs mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hoàn thành 100% bài học</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-on-surface">
            Xuất sắc! Bạn đã chinh phục bài học!
          </h2>
          <p className="text-xs text-outline mt-1 line-clamp-2 max-w-sm mx-auto">
            {video?.title || 'Bài học tiếng Đức'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
          <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/30">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Tiến độ câu</span>
            <span className="text-base font-bold text-secondary font-headline">
              {sentenceCount} / {sentenceCount} câu
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container/70 border border-outline-variant/30">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Phần thưởng XP</span>
            <span className="text-base font-bold text-amber-400 font-headline flex items-center gap-1">
              <span>+50 XP</span>
              <span className="text-xs">⚡</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2 max-w-sm mx-auto">
          {nextEpisode ? (
            <button
              type="button"
              onClick={onNextLesson}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-secondary to-primary hover:brightness-110 active:scale-95 text-on-primary font-headline font-bold text-sm shadow-lg shadow-secondary/25 transition-all cursor-pointer focus-ring"
            >
              <span>Tập tiếp theo: {nextEpisode.title}</span>
              <ArrowRight className="w-4 h-4" />
              <kbd className="hidden sm:inline px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">Enter ↵</kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLessons}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-secondary to-primary hover:brightness-110 active:scale-95 text-on-primary font-headline font-bold text-sm shadow-lg shadow-secondary/25 transition-all cursor-pointer focus-ring"
            >
              <BookOpen className="w-4 h-4" />
              <span>Mở Kho bài học</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onReplayLesson}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer focus-ring"
            >
              <RotateCcw className="w-3.5 h-3.5 text-outline" />
              <span>Học lại bài này</span>
            </button>

            <button
              type="button"
              onClick={onOpenLessons}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-secondary hover:text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer focus-ring"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kho bài học</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
