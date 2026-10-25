import React from 'react';
import { X, History, PlayCircle, Trash2, Calendar, Award, CheckCircle2, BookOpen, RotateCcw } from 'lucide-react';
import { formatTime } from '../../utils/timeFormat';

export default function StudyHistoryModal({
  isOpen,
  onClose,
  history = [],
  onSelectLesson,
  onResetLesson,
  onRemoveLesson,
  onClearHistory
}) {
  if (!isOpen) return null;

  const totalCompletedSentences = history.reduce((acc, h) => acc + (h.completedCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-inner border border-outline-variant/30">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Lịch sử bài học của tôi ({history.length})
              </h2>
              <p className="text-xs text-outline">Theo dõi tiến độ các video đã học và luyện tập lại</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="px-6 py-3 bg-surface-container/60 border-b border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-outline">Đã học: </span>
              <strong className="text-secondary font-bold">{history.length} video</strong>
            </div>
            <div>
              <span className="text-outline">Tổng số câu hoàn thành: </span>
              <strong className="text-primary font-bold">{totalCompletedSentences} câu</strong>
            </div>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-outline hover:text-error transition-colors cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* List of studied lessons */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-outline text-xs space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-outline opacity-40 animate-pulse" />
              <p className="text-sm font-semibold text-on-surface">Bạn chưa có lịch sử bài học nào</p>
              <p className="text-[11px]">Khi bạn chọn bài hoặc dán link YouTube để học, bài học sẽ tự động được lưu lại tại đây.</p>
            </div>
          ) : (
            history.map((lesson) => {
              const progressPct = lesson.totalSentences > 0
                ? Math.round(((lesson.completedCount || 0) / lesson.totalSentences) * 100)
                : 0;

              return (
                <div
                  key={lesson.videoId}
                  className="p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container-high/70 border border-outline-variant/30 hover:border-secondary/40 flex items-center gap-3.5 transition-all shadow-sm"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      onSelectLesson(lesson);
                      onClose();
                    }}
                    className="relative w-28 h-18 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest border border-outline-variant/30 cursor-pointer group"
                  >
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Info & Progress */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-secondary-container/20 text-secondary border border-secondary/30">
                        {lesson.language === 'de' ? '🇩🇪 Tiếng Đức' : '🇬🇧 Tiếng Anh'}
                      </span>
                      <span className="text-xs text-outline truncate">
                        Kênh: {lesson.author}
                      </span>
                    </div>

                    <h4
                      onClick={() => {
                        onSelectLesson(lesson);
                        onClose();
                      }}
                      className="text-xs sm:text-sm font-headline font-bold text-on-surface truncate hover:text-secondary cursor-pointer transition-colors"
                      title={lesson.title}
                    >
                      {lesson.title}
                    </h4>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-outline">
                        <span>Tiến độ: {lesson.completedCount || 0} / {lesson.totalSentences} câu ({progressPct}%)</span>
                        {lesson.lastStudiedAt && (
                          <span className="text-[10px] text-outline">
                            {new Date(lesson.lastStudiedAt).toLocaleDateString('vi-VN')}
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

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLesson(lesson);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary-container font-headline font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      Học tiếp
                    </button>
                    {onResetLesson && (lesson.completedCount > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          onResetLesson(lesson);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-surface-container hover:bg-error-container/20 text-outline hover:text-error border border-outline-variant/30 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                        title="Làm lại bài này từ câu đầu tiên"
                      >
                        <RotateCcw className="w-3 h-3 text-error" />
                        <span className="hidden sm:inline">Làm lại</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveLesson(lesson.videoId)}
                      className="p-1.5 text-outline hover:text-error rounded-full hover:bg-surface-container transition-all cursor-pointer"
                      title="Xóa bài này khỏi lịch sử"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
