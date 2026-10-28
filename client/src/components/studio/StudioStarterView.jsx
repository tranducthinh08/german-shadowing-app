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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl mx-auto pt-1">
        <button
          type="button"
          onClick={() => onLoadVideo('dC6ZGLzdaTs', 'de')}
          disabled={isLoading}
          className="p-3.5 rounded-2xl bg-surface-container-high/90 hover:bg-surface-bright border border-outline-variant/30 hover:border-secondary/50 text-left transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus-ring"
        >
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30">
              🇩🇪 A1 • Khởi đầu
            </span>
            <span className="text-[10px] text-outline font-mono">19 câu</span>
          </div>
          <p className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
            Nicos Weg: Folge 1
          </p>
          <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
            Hallo! Giới thiệu bản thân & tên
          </p>
          <span className="text-[10px] text-outline/80 mt-2 block font-medium">DW Deutsch • CEFR A1</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadVideo('jPvhLhCkhB8', 'de')}
          disabled={isLoading}
          className="p-3.5 rounded-2xl bg-surface-container-high/90 hover:bg-surface-bright border border-outline-variant/30 hover:border-secondary/50 text-left transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus-ring"
        >
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-tertiary/20 text-tertiary-fixed border border-tertiary/30">
              🇩🇪 B1 • Giao tiếp
            </span>
            <span className="text-[10px] text-outline font-mono">7 câu</span>
          </div>
          <p className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
            Easy German: Berlin
          </p>
          <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
            Phỏng vấn đường phố thực tế
          </p>
          <span className="text-[10px] text-outline/80 mt-2 block font-medium">Khẩu ngữ tự nhiên</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadVideo('gghSrnzS9kY', 'en')}
          disabled={isLoading}
          className="p-3.5 rounded-2xl bg-surface-container-high/90 hover:bg-surface-bright border border-outline-variant/30 hover:border-primary/50 text-left transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus-ring"
        >
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
              🇬🇧 Daily • Đời sống
            </span>
            <span className="text-[10px] text-outline font-mono">8 câu</span>
          </div>
          <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            Ordering at a Café
          </p>
          <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
            Hội thoại gọi cà phê chuẩn bản xứ
          </p>
          <span className="text-[10px] text-outline/80 mt-2 block font-medium">Tiếng Anh giao tiếp</span>
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
