import React, { useState, useMemo } from 'react';
import {
  History,
  BookOpen,
  ArrowLeft,
  Search,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NICOS_WEG_PLAYLIST } from '../../data/nicosWegPlaylist.js';
import HistoryStatsOverview from './HistoryStatsOverview';
import HistoryItemCard from './HistoryItemCard';
import NicosEpisodeCard from './NicosEpisodeCard';

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
  const [activeSubTab, setActiveSubTab] = useState('history');
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (h) =>
        (h.title && h.title.toLowerCase().includes(q)) ||
        (h.author && h.author.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  const filteredNicosEpisodes = useMemo(() => {
    let list = NICOS_WEG_PLAYLIST.episodes;

    if (nicosFilter !== 'all') {
      if (nicosFilter === 'special') {
        list = list.filter((ep) => ep.category !== 'Bài học A1');
      } else if (nicosFilter === 'studied') {
        list = list.filter((ep) => historyMap[ep.videoId]);
      } else if (nicosFilter.startsWith('stage_')) {
        const stageNum = parseInt(nicosFilter.replace('stage_', ''), 10);
        list = list.filter((ep) => {
          const num = ep.episodeNumber;
          if (stageNum === 1) return num >= 1 && num <= 18;
          if (stageNum === 2) return num >= 19 && num <= 36;
          if (stageNum === 3) return num >= 37 && num <= 54;
          if (stageNum === 4) return num >= 55 && num <= 76;
          return true;
        });
      }
    }

    if (nicosSearch.trim()) {
      const q = nicosSearch.toLowerCase();
      list = list.filter(
        (ep) =>
          (ep.title && ep.title.toLowerCase().includes(q)) ||
          (ep.category && ep.category.toLowerCase().includes(q)) ||
          (ep.episodeNumber && ep.episodeNumber.toString() === q)
      );
    }

    return list;
  }, [nicosFilter, nicosSearch, historyMap]);

  const nicosFilterOptions = [
    { id: 'all', label: 'Tất cả 76 tập' },
    { id: 'studied', label: `Đã học (${Object.keys(historyMap).filter(id => NICOS_WEG_PLAYLIST.episodes.some(e => e.videoId === id)).length})` },
    { id: 'stage_1', label: 'Chặng 1 (Tập 1 - 18)' },
    { id: 'stage_2', label: 'Chặng 2 (Tập 19 - 36)' },
    { id: 'stage_3', label: 'Chặng 3 (Tập 37 - 54)' },
    { id: 'stage_4', label: 'Chặng 4 (Tập 55 - 76)' },
    { id: 'special', label: 'Tập đặc biệt' }
  ];

  const handleStartEpisode = (ep) => {
    if (onSelectEpisode) {
      onSelectEpisode(ep);
    } else if (onSelectLesson) {
      onSelectLesson({
        videoId: ep.videoId,
        title: ep.title,
        author: 'DW Deutsch lernen',
        thumbnail: ep.thumbnail,
        language: 'de'
      });
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
          <HistoryStatsOverview
            historyCount={history.length}
            totalCompletedSentences={totalCompletedSentences}
            avgCompletion={avgCompletion}
          />

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
              filteredHistory.map((lesson) => (
                <HistoryItemCard
                  key={lesson.videoId}
                  lesson={lesson}
                  onSelectLesson={onSelectLesson}
                  onResetLesson={onResetLesson}
                  onRemoveLesson={onRemoveLesson}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TRỌN BỘ 76 TẬP NICOS WEG A1 */}
      {activeSubTab === 'nicos' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-secondary/15 via-primary/10 to-surface-container/80 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-secondary text-on-secondary shadow-xs">
                  A1 Tự Học
                </span>
                <span className="text-xs font-semibold text-secondary">
                  Deutsche Welle (DW)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
                Nicos Weg – Toàn bộ 76 tập có sẵn phụ đề chuẩn
              </h2>
              <p className="text-xs text-outline max-w-xl">
                Giáo trình phim học tiếng Đức hàng đầu thế giới của Đài DW. Hệ thống đã đồng bộ toàn bộ 2,428 câu đàm thoại.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase font-medium">Quy mô</span>
                <p className="text-sm font-headline font-bold text-on-surface">
                  {NICOS_WEG_PLAYLIST.totalSentences} câu thoại
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline pointer-events-none" />
                <input
                  type="text"
                  value={nicosSearch}
                  onChange={(e) => setNicosSearch(e.target.value)}
                  placeholder="Tìm tập (VD: Hallo, tập 1, Nico, Flughafen...)"
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:border-secondary focus:outline-none transition-all placeholder:text-outline"
                />
                {nicosSearch && (
                  <button
                    type="button"
                    onClick={() => setNicosSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-outline hover:text-on-surface"
                  >
                    ×
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
            {filteredNicosEpisodes.map((ep) => (
              <NicosEpisodeCard
                key={ep.id}
                ep={ep}
                studied={historyMap[ep.videoId]}
                onStartEpisode={handleStartEpisode}
              />
            ))}
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
