import React from 'react';
import { PlayCircle, RotateCcw, Trash2 } from 'lucide-react';

export default function HistoryItemCard({
  lesson,
  onSelectLesson,
  onResetLesson,
  onRemoveLesson
}) {
  const progressPct = lesson.totalSentences > 0
    ? Math.round(((lesson.completedCount || 0) / lesson.totalSentences) * 100)
    : 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface-container/70 hover:bg-surface-container-high/70 border border-outline-variant/30 hover:border-secondary/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs">
      {/* Thumbnail & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
        <div
          onClick={() => onSelectLesson && onSelectLesson(lesson)}
          className="relative w-28 sm:w-32 h-18 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest border border-outline-variant/30 cursor-pointer group shadow-sm"
        >
          <img
            src={lesson.thumbnail}
            alt={lesson.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.2 rounded-md font-bold bg-secondary-container/20 text-secondary border border-secondary/30">
              {lesson.language === 'de' ? '🇩🇪 Tiếng Đức' : '🇬🇧 Tiếng Anh'}
            </span>
            <span className="text-xs text-outline truncate">
              {lesson.author}
            </span>
          </div>

          <h3
            onClick={() => onSelectLesson && onSelectLesson(lesson)}
            className="text-xs sm:text-sm font-headline font-semibold text-on-surface truncate hover:text-secondary cursor-pointer transition-colors"
            title={lesson.title}
          >
            {lesson.title}
          </h3>

          {/* Progress Bar */}
          <div className="space-y-1 pt-1 max-w-md">
            <div className="flex items-center justify-between text-[11px] text-outline">
              <span>Tiến độ: <strong className="text-on-surface">{lesson.completedCount || 0}</strong> / {lesson.totalSentences} câu ({progressPct}%)</span>
              {lesson.lastStudiedAt && (
                <span className="text-[10px] text-outline hidden sm:inline">
                  Học gần nhất: {new Date(lesson.lastStudiedAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={() => onSelectLesson && onSelectLesson(lesson)}
          className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-headline font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          Học tiếp
        </button>

        {onResetLesson && (lesson.completedCount > 0) && (
          <button
            type="button"
            onClick={() => onResetLesson(lesson)}
            className="px-3 py-2 rounded-full bg-surface-container hover:bg-error-container/20 text-outline hover:text-error border border-outline-variant/30 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            title="Làm lại bài này từ câu đầu tiên"
          >
            <RotateCcw className="w-3.5 h-3.5 text-error" />
            <span className="hidden sm:inline">Làm lại</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemoveLesson && onRemoveLesson(lesson.videoId)}
          className="p-2 text-outline hover:text-error rounded-full hover:bg-surface-container transition-all cursor-pointer"
          title="Xóa bài này khỏi lịch sử"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
