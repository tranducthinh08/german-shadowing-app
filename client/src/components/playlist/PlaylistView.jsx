import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Play,
  Search,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  Music,
  GraduationCap,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { NICOS_WEG_PLAYLIST } from '../../data/nicosWegPlaylist.js';

export default function PlaylistView({
  onSelectEpisode,
  completedVideoIds = [],
  currentVideoId = null,
  onBackToStudio
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'Tất cả (80)', min: 0, max: 999 },
    { id: 'part1', label: 'Tập 1 – 20 (Khởi đầu)', min: 1, max: 20 },
    { id: 'part2', label: 'Tập 21 – 40 (Đời sống)', min: 21, max: 40 },
    { id: 'part3', label: 'Tập 41 – 60 (Giao tiếp & Mua sắm)', min: 41, max: 60 },
    { id: 'part4', label: 'Tập 61 – 76 (Xã hội & Gia đình)', min: 61, max: 76 },
    { id: 'special', label: 'Đặc biệt & Bài hát', special: true }
  ];

  const filteredEpisodes = useMemo(() => {
    return NICOS_WEG_PLAYLIST.episodes.filter(ep => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = ep.title.toLowerCase().includes(query);
        const matchFull = ep.fullTitle.toLowerCase().includes(query);
        const matchNum = `tập ${ep.episodeNumber}`.includes(query) || `folge ${ep.episodeNumber}`.includes(query) || `${ep.episodeNumber}` === query;
        if (!matchTitle && !matchFull && !matchNum) return false;
      }

      // Range/category filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'special') {
        return ep.category !== 'Bài học A1' || ep.episodeNumber === 0;
      }

      const activeOpt = filterOptions.find(f => f.id === selectedFilter);
      if (activeOpt && activeOpt.min !== undefined) {
        return ep.episodeNumber >= activeOpt.min && ep.episodeNumber <= activeOpt.max && ep.category === 'Bài học A1';
      }

      return true;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low border border-outline-variant/40 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary/20 text-secondary border border-secondary/30">
                <GraduationCap className="w-3.5 h-3.5" />
                Giáo trình DW A1 chính thức
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                🇩🇪 Tiếng Đức chuẩn
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-tertiary/10 text-tertiary border border-tertiary/20">
                ⚡ 100% Không bao giờ lỗi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Nicos Weg – Einfach Deutsch lernen
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Trọn bộ 76 tập phim học tiếng Đức trình độ A1 của Deutsche Welle. Toàn bộ các tập đã được tích hợp sẵn phụ đề chuẩn từng giây, chia câu tự động và hỗ trợ dịch từ vựng, luyện nghe & chép chính tả ngay lập tức!
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-outline">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-on-surface">{NICOS_WEG_PLAYLIST.totalEpisodes}</span> tập đầy đủ
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-on-surface">{NICOS_WEG_PLAYLIST.totalSentences.toLocaleString()}</span> câu thực hành
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-on-surface">{completedVideoIds.length}</span> tập đã học
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                const firstEp = NICOS_WEG_PLAYLIST.episodes.find(e => e.episodeNumber === 1) || NICOS_WEG_PLAYLIST.episodes[0];
                onSelectEpisode(firstEp);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-secondary to-primary hover:opacity-95 text-on-primary font-headline font-bold text-xs sm:text-sm shadow-lg shadow-secondary/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Học từ Tập 1: Hallo!</span>
            </button>
            {onBackToStudio && (
              <button
                type="button"
                onClick={onBackToStudio}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer"
              >
                <span>Về phòng luyện tập</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài hoặc số tập (VD: Hallo, Tập 5, Essen)..."
              className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-secondary rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-outline font-medium text-right">
            Hiển thị <span className="font-bold text-on-surface">{filteredEpisodes.length}</span> / {NICOS_WEG_PLAYLIST.episodes.length} tập
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === opt.id
                  ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEpisodes.map((ep) => {
          const isCompleted = completedVideoIds.includes(ep.videoId);
          const isCurrent = currentVideoId === ep.videoId;

          return (
            <div
              key={ep.id}
              onClick={() => onSelectEpisode(ep)}
              className={`group relative flex flex-col justify-between rounded-2xl p-3.5 border transition-all cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl ${
                isCurrent
                  ? isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-secondary-container/20 border-secondary ring-1 ring-secondary'
                  : isCompleted
                  ? 'bg-surface-container/80 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 hover:border-secondary/40'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-high mb-3">
                <img
                  src={ep.thumbnail}
                  alt={ep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to default thumbnail if needed
                    e.target.src = `https://img.youtube.com/vi/${ep.videoId}/0.jpg`;
                  }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge top-left: Episode Number */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {ep.episodeNumber > 0 ? `Tập ${ep.episodeNumber}` : 'Special'}
                  </span>
                  {ep.category !== 'Bài học A1' && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-secondary/80 backdrop-blur-md text-white">
                      {ep.category}
                    </span>
                  )}
                </div>

                {/* Badge top-right: Status */}
                {isCompleted ? (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã học</span>
                  </div>
                ) : isCurrent ? (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-on-secondary flex items-center gap-1 shadow-xs animate-pulse">
                    <span>Đang học</span>
                  </div>
                ) : null}

                {/* Bottom info on thumbnail */}
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

              {/* Title & Description */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-headline font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {ep.title}
                  </h3>
                  <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
                    DW Deutsch lernen • A1
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-outline-variant/20">
                  <span className="text-outline">
                    {ep.sentenceCount} câu đàm thoại
                  </span>
                  <span className={`font-semibold transition-colors flex items-center gap-1 ${
                    isCompleted ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-secondary group-hover:text-primary'
                  }`}>
                    {isCompleted ? 'Luyện lại' : isCurrent ? 'Học tiếp' : 'Luyện tập'}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEpisodes.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <BookOpen className="w-8 h-8 text-outline mx-auto" />
          <h3 className="text-sm font-semibold text-on-surface">Không tìm thấy tập nào</h3>
          <p className="text-xs text-outline max-w-sm mx-auto">
            Không có tập phim nào khớp với từ khóa "{searchQuery}". Bạn hãy thử tìm với từ khác hoặc xóa bộ lọc.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-high text-secondary hover:bg-surface-bright"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
