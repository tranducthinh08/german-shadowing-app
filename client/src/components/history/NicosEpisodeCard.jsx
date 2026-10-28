import React from 'react';
import { Sparkles, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NicosEpisodeCard({
  ep,
  studied,
  onStartEpisode
}) {
  const isCompleted = studied && (studied.completedCount >= (studied.totalSentences || 1));
  const progressPct = studied && ep.sentenceCount > 0
    ? Math.min(100, Math.round(((studied.completedCount || 0) / ep.sentenceCount) * 100))
    : 0;

  return (
    <div
      onClick={() => onStartEpisode && onStartEpisode(ep)}
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
              <span>{studied?.practiceCount > 1 ? `Đã học (${studied.practiceCount} lần)` : 'Đã học'}</span>
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
}
