import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Layers } from 'lucide-react';
import { NICOS_WEG_PLAYLIST, NICOS_WEG_EPISODES_MAP } from '../../data/nicosWegPlaylist.js';

export default function EpisodeNavBar({
  currentVideoId,
  onSelectEpisode,
  onOpenPlaylistView
}) {
  const currentEp = NICOS_WEG_EPISODES_MAP[currentVideoId];
  if (!currentEp) return null;

  // Find index in episodes list
  const currentIndex = NICOS_WEG_PLAYLIST.episodes.findIndex(e => e.videoId === currentVideoId);
  const prevEp = currentIndex > 0 ? NICOS_WEG_PLAYLIST.episodes[currentIndex - 1] : null;
  const nextEp = currentIndex >= 0 && currentIndex < NICOS_WEG_PLAYLIST.episodes.length - 1 
    ? NICOS_WEG_PLAYLIST.episodes[currentIndex + 1] 
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:px-3 bg-surface-container-low/90 backdrop-blur-md rounded-xl border border-outline-variant/30 text-xs shadow-xs mb-3">
      {/* Left: Previous Episode Button */}
      <button
        type="button"
        disabled={!prevEp}
        onClick={() => prevEp && onSelectEpisode(prevEp)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
          prevEp
            ? 'hover:bg-surface-container-high text-on-surface hover:text-secondary'
            : 'text-outline/40 cursor-not-allowed opacity-50'
        }`}
        title={prevEp ? `Tập trước: ${prevEp.title}` : 'Đang ở tập đầu tiên'}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tập trước</span>
      </button>

      {/* Middle: Current Episode Badge & Dropdown / Title */}
      <div className="flex items-center gap-2 max-w-[200px] sm:max-w-md truncate">
        <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
          {currentEp.episodeNumber > 0 ? `Tập ${currentEp.episodeNumber}` : 'Special'}
        </span>
        <span className="font-semibold text-on-surface truncate text-xs" title={currentEp.title}>
          {currentEp.title}
        </span>
        <button
          type="button"
          onClick={onOpenPlaylistView}
          className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-secondary hover:text-primary transition-colors underline cursor-pointer ml-1"
          title="Xem trọn bộ 80 tập Nicos Weg"
        >
          <BookOpen className="w-3 h-3" />
          <span className="hidden md:inline">Danh sách tập</span>
        </button>
      </div>

      {/* Right: Next Episode Button */}
      <button
        type="button"
        disabled={!nextEp}
        onClick={() => nextEp && onSelectEpisode(nextEp)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
          nextEp
            ? 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 hover:scale-[1.02]'
            : 'text-outline/40 cursor-not-allowed opacity-50'
        }`}
        title={nextEp ? `Tập tiếp theo: ${nextEp.title}` : 'Đã là tập cuối cùng'}
      >
        <span className="hidden sm:inline">Tập tiếp</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
