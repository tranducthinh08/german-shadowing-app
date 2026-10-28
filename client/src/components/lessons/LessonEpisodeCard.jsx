import React from 'react';
import { Sparkles, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LessonEpisodeCard({
  ep,
  isCompleted = false,
  isCurrent = false,
  onSelectEpisode
}) {
  return (
    <div
      onClick={() => onSelectEpisode && onSelectEpisode(ep)}
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
            e.target.src = `https://img.youtube.com/vi/${ep.videoId}/0.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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

        <div className="pt-2 flex items-center justify-between text-[11px] border-t border-outline-variant/20">
          <span className="text-outline">
            {ep.sentenceCount} câu đàm thoại
          </span>
          <span className={`font-semibold transition-colors flex items-center gap-1 ${
            isCompleted ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-secondary group-hover:text-primary'
          }`}>
            {isCompleted ? 'Luyện lại' : isCurrent ? 'Học tiếp' : 'Học tập này'}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
