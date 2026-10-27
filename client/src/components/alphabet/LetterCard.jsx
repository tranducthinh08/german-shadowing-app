import React from 'react';
import { Star, CheckCircle2, Volume2 } from 'lucide-react';

export default function LetterCard({
  item,
  idx,
  isStarred = false,
  isFeaturedToday = false,
  isCompletedToday = false,
  isCurrentlyPlaying = false,
  activeFilter = 'daily5',
  playingAudioId,
  onSelect,
  onToggleStar,
  onToggleSoundCompleted,
  onPlayLetter
}) {
  return (
    <div
      onClick={() => onSelect && onSelect(item)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
        isCurrentlyPlaying
          ? 'bg-secondary/20 border-secondary ring-2 ring-secondary/40 scale-102 shadow-lg shadow-secondary/10'
          : isFeaturedToday && activeFilter === 'daily5'
            ? isCompletedToday
              ? 'bg-surface-container-low border-emerald-500/50 shadow-sm shadow-emerald-500/10'
              : 'bg-surface-container-low border-secondary/50 shadow-md shadow-secondary/10 ring-1 ring-secondary/20'
            : 'bg-surface-container-low/90 hover:bg-surface-container-high border-outline-variant/30 hover:border-outline-variant/60 shadow-xs'
      }`}
    >
      {/* Top Row: Difficulty Tag, Featured badge & Star */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate ${
            item.isDifficult
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'bg-surface-container-high text-outline'
          }`}>
            {item.category === 'umlaut' ? 'Umlaut' : item.category === 'cluster' ? 'Cụm âm' : item.name}
          </span>

          {isFeaturedToday && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-secondary/20 text-secondary border border-secondary/30">
              🎯 Tiêu điểm
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => onToggleStar && onToggleStar(e, item.id)}
          className={`p-1 rounded-lg transition-transform hover:scale-120 cursor-pointer ${
            isStarred
              ? 'text-amber-400'
              : 'text-outline-variant hover:text-amber-400'
          }`}
          title={isStarred ? 'Bỏ đánh dấu chữ khó' : 'Đánh dấu cần ôn tập'}
        >
          <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Big Letter Display */}
      <div className="text-center my-1">
        <div className="text-2xl sm:text-3xl font-black font-headline text-on-surface group-hover:text-secondary transition-colors">
          {item.letter}
        </div>
        <div className="text-xs font-semibold text-secondary mt-0.5">
          {item.ipa}
        </div>
        <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
          ({item.viApprox})
        </div>
      </div>

      {/* Bottom Quick Play Button & Check-off Toggle */}
      <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between gap-2">
        {isFeaturedToday ? (
          <button
            type="button"
            onClick={(e) => onToggleSoundCompleted && onToggleSoundCompleted(e, item.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isCompletedToday
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-surface-container-high hover:bg-emerald-500/10 text-on-surface-variant hover:text-emerald-300 border border-outline-variant/30'
            }`}
            title={isCompletedToday ? 'Đã hoàn thành âm này hôm nay' : 'Đánh dấu hoàn thành'}
          >
            <CheckCircle2 className={`w-3 h-3 ${isCompletedToday ? 'text-emerald-400' : 'text-outline'}`} />
            <span>{isCompletedToday ? 'Đã ôn ✓' : 'Đánh dấu ôn'}</span>
          </button>
        ) : (
          <div className="text-[10px] text-outline truncate max-w-[85px]">
            {item.examples?.[0]?.de || ''}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => onPlayLetter && onPlayLetter(e, item)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            playingAudioId === item.id || playingAudioId === `phonics_${item.id}`
              ? 'bg-secondary text-on-secondary ring-2 ring-secondary/50 scale-110 shadow-sm'
              : 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface-variant'
          }`}
          title="Nghe âm vị tự nhiên khi ghép từ (Bấm vào thẻ để nghe cả tên chữ cái đánh vần)"
        >
          <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === item.id || playingAudioId === `phonics_${item.id}` ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </div>
  );
}
