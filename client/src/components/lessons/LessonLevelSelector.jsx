import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function LessonLevelSelector({
  levels = [],
  activeLevel,
  onSelectLevel
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {levels.map((lvl) => {
        const isActive = activeLevel === lvl.id;
        return (
          <button
            key={lvl.id}
            type="button"
            onClick={() => onSelectLevel && onSelectLevel(lvl.id)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group shadow-xs ${
              isActive
                ? 'bg-secondary-container/25 border-secondary ring-1 ring-secondary shadow-md'
                : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 hover:border-secondary/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-headline text-on-surface group-hover:text-primary transition-colors">
                  {lvl.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-high text-secondary border border-secondary/20'
                }`}>
                  {lvl.badge}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-outline font-medium">
                <span>{lvl.lang}</span>
                <span>•</span>
                <span>{lvl.subtitle}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant line-clamp-1 pt-0.5">
                {lvl.desc}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-outline-variant/20">
              <span className="text-outline font-medium">{lvl.episodesCount}</span>
              <span className={`font-bold flex items-center gap-1 ${
                isActive ? 'text-secondary' : 'text-outline group-hover:text-on-surface'
              }`}>
                {isActive ? 'Đang chọn' : 'Xem bài'}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
