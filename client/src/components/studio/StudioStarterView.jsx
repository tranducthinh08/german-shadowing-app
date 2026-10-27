import React from 'react';
import { Sparkles, GraduationCap, BookOpen, History } from 'lucide-react';

export default function StudioStarterView({
  isLoading,
  hasHistory,
  historyCount = 0,
  onOpenLessons,
  onLoadVideo,
  onOpenHistory
}) {
  return (
    <div className="p-8 sm:p-10 text-center rounded-2xl bg-surface-container/70 border border-outline-variant/30 space-y-5 shadow-xl backdrop-blur-xl">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center mx-auto shadow-md">
        <Sparkles className="w-6 h-6 text-on-primary-container" />
      </div>
      <div>
        <h2 className="text-lg font-headline font-bold text-on-surface">
          Bắt đầu bài học của bạn
        </h2>
        <p className="text-xs text-outline max-w-md mx-auto mt-1 leading-relaxed">
          Dán link YouTube bất kỳ vào thanh tìm kiếm ở trên, hoặc bấm chọn một bài học chuẩn dưới đây để bắt đầu ngay:
        </p>
      </div>

      {/* Featured Curriculum: Nicos Weg A1 (DW) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-secondary/15 via-surface-container-high to-primary/10 border border-secondary/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm max-w-xl mx-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-on-secondary">
              TRỌN BỘ 76 TẬP
            </span>
            <span className="text-xs font-bold text-secondary flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Giáo trình Nicos Weg A1 (DW)
            </span>
          </div>
          <p className="text-[11px] text-outline leading-snug">
            80 video bài học đã tích hợp sẵn 100% phụ đề chuẩn, chia câu tự động và học offline/online không bao giờ lỗi.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLessons}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-secondary to-primary hover:opacity-95 text-on-primary font-bold text-xs shadow-md shadow-secondary/20 hover:scale-105 transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mở kho bài học (A1 • A2)</span>
        </button>
      </div>

      {/* Quick Starter Lessons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-1">
        <button
          type="button"
          onClick={() => onLoadVideo('dC6ZGLzdaTs', 'de')}
          disabled={isLoading}
          className="p-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-bright border border-outline-variant/30 hover:border-secondary/40 text-left transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary mb-1">
            <span>🇩🇪</span>
            <span>Nicos Weg A1</span>
          </div>
          <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            Folge 1: Hallo!
          </p>
          <span className="text-[10px] text-outline mt-1 block">DW Deutsch • 19 câu</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadVideo('jPvhLhCkhB8', 'de')}
          disabled={isLoading}
          className="p-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-bright border border-outline-variant/30 hover:border-secondary/40 text-left transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary mb-1">
            <span>🇩🇪</span>
            <span>Easy German</span>
          </div>
          <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            Berlin: What do you like?
          </p>
          <span className="text-[10px] text-outline mt-1 block">Giao tiếp • 7 câu</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadVideo('gghSrnzS9kY', 'en')}
          disabled={isLoading}
          className="p-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-bright border border-outline-variant/30 hover:border-primary/40 text-left transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1">
            <span>🇬🇧</span>
            <span>English Daily</span>
          </div>
          <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            Ordering at a Café
          </p>
          <span className="text-[10px] text-outline mt-1 block">Hội thoại • 8 câu</span>
        </button>
      </div>

      {hasHistory && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container-high hover:bg-surface-bright text-secondary font-semibold text-xs rounded-full border border-outline-variant/30 transition-all cursor-pointer shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-primary" />
            <span>Xem lại lịch sử học tập ({historyCount} bài)</span>
          </button>
        </div>
      )}
    </div>
  );
}
