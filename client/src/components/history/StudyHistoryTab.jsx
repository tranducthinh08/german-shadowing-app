import React, { useState, useMemo } from 'react';
import {
  History,
  PlayCircle,
  Trash2,
  BookOpen,
  RotateCcw,
  ArrowLeft,
  Search,
  CheckCircle2,
  Video,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  Play
} from 'lucide-react';
import { NICOS_WEG_PLAYLIST } from '../../data/nicosWegPlaylist.js';

export default function StudyHistoryTab({
  history = [],
  onSelectLesson,
  onSelectEpisode,
  onResetLesson,
  onRemoveLesson,
  onClearHistory,
  onBackToStudio,
  hasActiveVideo = false
}) {
  // Sub-tabs: 'history' (Bài đã học gần đây) | 'nicos' (Trọn bộ Nicos Weg 76 tập)
  const [activeSubTab, setActiveSubTab] = useState('history');

  // Search & Filter for History
  const [searchQuery, setSearchQuery] = useState('');

  // Search & Filter for Nicos Weg
  const [nicosSearch, setNicosSearch] = useState('');
  const [nicosFilter, setNicosFilter] = useState('all');

  const historyMap = useMemo(() => {
    return history.reduce((acc, h) => {
      acc[h.videoId] = h;
      return acc;
    }, {});
  }, [history]);

  const totalCompletedSentences = history.reduce((acc, h) => acc + (h.completedCount || 0), 0);
  const totalSentences = history.reduce((acc, h) => acc + (h.totalSentences || 0), 0);
  const avgCompletion = totalSentences > 0 ? Math.round((totalCompletedSentences / totalSentences) * 100) : 0;

  // Filter history items
  const filteredHistory = useMemo(() => {
    return history.filter((item) =>
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  // Nicos Weg Filter Options
  const nicosFilterOptions = [
    { id: 'all', label: 'Tất cả (80 tập)', min: 0, max: 999 },
    { id: 'part1', label: 'Tập 1 – 20 (Cơ bản)', min: 1, max: 20 },
    { id: 'part2', label: 'Tập 21 – 40 (Đời sống)', min: 21, max: 40 },
    { id: 'part3', label: 'Tập 41 – 60 (Giao tiếp)', min: 41, max: 60 },
    { id: 'part4', label: 'Tập 61 – 76 (Xã hội)', min: 61, max: 76 },
    { id: 'special', label: 'Bài hát & Đặc biệt', special: true }
  ];

  // Filter Nicos Weg episodes
  const filteredNicosEpisodes = useMemo(() => {
    return NICOS_WEG_PLAYLIST.episodes.filter((ep) => {
      if (nicosSearch.trim()) {
        const query = nicosSearch.toLowerCase().trim();
        const matchTitle = ep.title.toLowerCase().includes(query);
        const matchFull = ep.fullTitle.toLowerCase().includes(query);
        const matchNum = `tập ${ep.episodeNumber}`.includes(query) || `folge ${ep.episodeNumber}`.includes(query) || `${ep.episodeNumber}` === query;
        if (!matchTitle && !matchFull && !matchNum) return false;
      }

      if (nicosFilter === 'all') return true;
      if (nicosFilter === 'special') {
        return ep.category !== 'Bài học A1' || ep.episodeNumber === 0;
      }

      const activeOpt = nicosFilterOptions.find((f) => f.id === nicosFilter);
      if (activeOpt && activeOpt.min !== undefined) {
        return ep.episodeNumber >= activeOpt.min && ep.episodeNumber <= activeOpt.max && ep.category === 'Bài học A1';
      }

      return true;
    });
  }, [nicosSearch, nicosFilter]);

  const handleStartEpisode = (ep) => {
    if (onSelectEpisode) {
      onSelectEpisode(ep);
    } else if (onSelectLesson) {
      onSelectLesson({ videoId: ep.videoId, language: 'de' });
    }
  };

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
              Trung tâm học tập & Lịch sử
            </h1>
            <p className="text-xs text-outline">
              Theo dõi tiến độ học tập hoặc chọn học trọn bộ 76 tập giáo trình Nicos Weg A1
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

      {/* Sub-tab Navigation Switcher */}
      <div className="flex items-center p-1 bg-surface-container-low rounded-2xl border border-outline-variant/30 w-full sm:w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-headline font-semibold transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bài đã học gần đây</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeSubTab === 'history'
              ? 'bg-on-primary-container/20 text-on-primary-container'
              : 'bg-surface-container-high text-outline'
          }`}>
            {history.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('nicos')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-headline font-semibold transition-all cursor-pointer ${
            activeSubTab === 'nicos'
              ? 'bg-secondary-container text-on-secondary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-secondary" />
          <span>Trọn bộ Nicos Weg (76 tập A1)</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeSubTab === 'nicos'
              ? 'bg-on-secondary-container/20 text-on-secondary-container'
              : 'bg-secondary/15 text-secondary'
          }`}>
            76 tập
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: LỊCH SỬ BÀI HỌC GẦN ĐÂY */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
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

          {/* History Lessons List */}
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-4">
                <BookOpen className="w-12 h-12 mx-auto text-secondary/60 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-base font-headline font-semibold text-on-surface">Chưa có bài học nào trong lịch sử</h3>
                  <p className="text-xs text-outline max-w-md mx-auto">
                    Bạn có thể chọn một bài học chuẩn trong giáo trình 76 tập Nicos Weg A1 để bắt đầu ngay bây giờ!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('nicos')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-on-primary font-headline font-bold text-xs shadow-md shadow-secondary/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Xem trọn bộ 76 tập Nicos Weg</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
      )}

      {/* SUB-TAB 2: TRỌN BỘ NICOS WEG 76 TẬP A1 */}
      {activeSubTab === 'nicos' && (
        <div className="space-y-5">
          {/* Header Description Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-secondary/15 via-surface-container-high to-primary/10 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-secondary text-on-secondary">
                  DEUTSCHE WELLE
                </span>
                <h2 className="text-sm sm:text-base font-headline font-bold text-on-surface">
                  Nicos Weg – Giáo trình A1 toàn diện (80 tập & 2.443 câu thoại)
                </h2>
              </div>
              <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                Đã tích hợp sẵn 100% phụ đề tiếng Đức chuẩn từng giây. Bạn có thể chọn bất kỳ tập nào để bắt đầu nghe chép chính tả hoặc nói đuổi ngay lập tức mà không bao giờ bị lỗi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const ep1 = NICOS_WEG_PLAYLIST.episodes.find(e => e.episodeNumber === 1);
                if (ep1) handleStartEpisode(ep1);
              }}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary hover:opacity-95 text-on-primary font-bold text-xs shadow-md shadow-secondary/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Học từ Tập 1: Hallo!</span>
            </button>
          </div>

          {/* Search & Filter Bar for Nicos Weg */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  value={nicosSearch}
                  onChange={(e) => setNicosSearch(e.target.value)}
                  placeholder="Tìm theo số tập hoặc tên bài (VD: Hallo, Tập 5, Essen, Wohnung)..."
                  className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-secondary rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none transition-all shadow-xs"
                />
                {nicosSearch && (
                  <button
                    type="button"
                    onClick={() => setNicosSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="text-xs text-outline font-medium text-right">
                Hiển thị <span className="font-bold text-on-surface">{filteredNicosEpisodes.length}</span> / {NICOS_WEG_PLAYLIST.episodes.length} tập
              </div>
            </div>

            {/* Stage filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {nicosFilterOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setNicosFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    nicosFilter === opt.id
                      ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Episode List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredNicosEpisodes.map((ep) => {
              const studied = historyMap[ep.videoId];
              const isCompleted = studied && (studied.completedCount >= (studied.totalSentences || 1));
              const progressPct = studied && ep.sentenceCount > 0
                ? Math.min(100, Math.round(((studied.completedCount || 0) / ep.sentenceCount) * 100))
                : 0;

              return (
                <div
                  key={ep.id}
                  onClick={() => handleStartEpisode(ep)}
                  className={`group relative flex flex-col justify-between rounded-2xl p-3 border transition-all cursor-pointer hover:scale-[1.01] shadow-xs hover:shadow-lg ${
                    isCompleted
                      ? 'bg-surface-container/80 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 hover:border-secondary/40'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-high">
                      <img
                        src={ep.thumbnail}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${ep.videoId}/0.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/10">
                          {ep.episodeNumber > 0 ? `Tập ${ep.episodeNumber}` : 'Special'}
                        </span>
                        {ep.category !== 'Bài học A1' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-secondary/80 backdrop-blur-md text-white">
                            {ep.category}
                          </span>
                        )}
                      </div>

                      {isCompleted && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã học</span>
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90">
                        <span className="flex items-center gap-1 font-medium">
                          <Sparkles className="w-3 h-3 text-secondary" />
                          {ep.sentenceCount} câu
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-secondary backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110">
                          <Play className="w-3 h-3 fill-current text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="text-xs sm:text-sm font-headline font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {ep.title}
                      </h3>
                      <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
                        DW Deutsch lernen • A1
                      </p>
                    </div>

                    {/* Progress Bar if practiced */}
                    {studied && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-outline">
                          <span>Đã học {studied.completedCount || 0} / {ep.sentenceCount} câu</span>
                          <span className="font-bold text-on-surface">{progressPct}%</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer */}
                  <div className="pt-2.5 mt-2 flex items-center justify-between text-[11px] border-t border-outline-variant/20">
                    <span className="text-outline">
                      {ep.sentenceCount} câu đàm thoại
                    </span>
                    <span className="font-semibold text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
                      {studied ? 'Học tiếp' : 'Học ngay'}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNicosEpisodes.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
              <p className="text-xs text-outline">Không tìm thấy tập nào khớp với từ khóa "{nicosSearch}".</p>
              <button
                type="button"
                onClick={() => { setNicosSearch(''); setNicosFilter('all'); }}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-surface-container-high text-secondary"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
