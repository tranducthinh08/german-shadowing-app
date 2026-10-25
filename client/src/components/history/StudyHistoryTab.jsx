import React, { useState } from 'react';
import { History, PlayCircle, Trash2, BookOpen, RotateCcw, ArrowLeft, Search, CheckCircle2, Video } from 'lucide-react';

export default function StudyHistoryTab({
  history = [],
  onSelectLesson,
  onResetLesson,
  onRemoveLesson,
  onClearHistory,
  onBackToStudio,
  hasActiveVideo = false
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const totalCompletedSentences = history.reduce((acc, h) => acc + (h.completedCount || 0), 0);
  const totalSentences = history.reduce((acc, h) => acc + (h.totalSentences || 0), 0);
  const avgCompletion = totalSentences > 0 ? Math.round((totalCompletedSentences / totalSentences) * 100) : 0;

  const filteredHistory = history.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.author || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-lg sm:text-xl text-on-surface">
              Lịch sử bài học của bạn
            </h1>
            <p className="text-xs text-outline">
              Xem lại tiến độ học tập, tiếp tục bài dang dở hoặc làm lại từ đầu
            </p>
          </div>
        </div>

        {hasActiveVideo && (
          <button
            type="button"
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-headline font-semibold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại bài đang học</span>
          </button>
        )}
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
            <Video className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <span className="text-[11px] text-outline font-medium">Tổng số bài học</span>
            <p className="text-base sm:text-lg font-headline font-bold text-on-surface">{history.length} video</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-[11px] text-outline font-medium">Số câu đã hoàn thành</span>
            <p className="text-base sm:text-lg font-headline font-bold text-on-surface">{totalCompletedSentences} câu</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary">
            <span className="font-headline font-bold text-sm text-tertiary">%</span>
          </div>
          <div>
            <span className="text-[11px] text-outline font-medium">Tiến độ trung bình</span>
            <p className="text-base sm:text-lg font-headline font-bold text-on-surface">{avgCompletion}%</p>
          </div>
        </div>
      </div>

      {/* Filter and Clear Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài học hoặc kênh..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low text-on-surface text-xs rounded-full border border-outline-variant/30 focus:border-secondary focus:outline-none transition-all placeholder:text-outline"
          />
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xoá toàn bộ lịch sử học tập không?')) {
                onClearHistory();
              }
            }}
            className="text-xs text-outline hover:text-error transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-error-container/10 border border-transparent hover:border-error/20"
          >
            Xoá toàn bộ lịch sử
          </button>
        )}
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-outline/40 animate-pulse" />
            <h3 className="text-base font-headline font-semibold text-on-surface">Chưa có bài học nào trong lịch sử</h3>
            <p className="text-xs text-outline max-w-sm mx-auto">
              Khi bạn dán link YouTube để học nghe chép hoặc nói đuổi, tiến độ và bài học sẽ tự động được lưu trữ tại đây.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container/60 border border-outline-variant/30 text-xs text-outline">
            Không tìm thấy bài học nào khớp với từ khóa "{searchQuery}".
          </div>
        ) : (
          filteredHistory.map((lesson) => {
            const progressPct = lesson.totalSentences > 0
              ? Math.round(((lesson.completedCount || 0) / lesson.totalSentences) * 100)
              : 0;

            return (
              <div
                key={lesson.videoId}
                className="p-4 sm:p-5 rounded-2xl bg-surface-container/70 hover:bg-surface-container-high/70 border border-outline-variant/30 hover:border-secondary/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
                  <div
                    onClick={() => onSelectLesson(lesson)}
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
                      onClick={() => onSelectLesson(lesson)}
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
                    onClick={() => onSelectLesson(lesson)}
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
                    onClick={() => onRemoveLesson(lesson.videoId)}
                    className="p-2 text-outline hover:text-error rounded-full hover:bg-surface-container transition-all cursor-pointer"
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
  );
}
