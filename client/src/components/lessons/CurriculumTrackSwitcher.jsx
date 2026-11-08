import React from 'react';
import { Film, Radio } from 'lucide-react';

export default function CurriculumTrackSwitcher({
  activeTrack = 'nicos_weg',
  onChangeTrack,
  nicosCount = 80,
  easyGermanCount = 10
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface-container/80 backdrop-blur-md border border-outline-variant/30 shadow-xs">
      {/* Track 1: Nicos Weg */}
      <button
        type="button"
        onClick={() => onChangeTrack('nicos_weg')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeTrack === 'nicos_weg'
            ? 'bg-secondary text-on-secondary shadow-md scale-[1.02]'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }`}
      >
        <Film className="w-3.5 h-3.5" />
        <span>Nicos Weg (DW)</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
          activeTrack === 'nicos_weg' ? 'bg-black/25 text-white' : 'bg-surface-container text-outline'
        }`}>
          {nicosCount} tập
        </span>
      </button>

      {/* Track 2: Easy German */}
      <button
        type="button"
        onClick={() => onChangeTrack('easy_german')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeTrack === 'easy_german'
            ? 'bg-secondary text-on-secondary shadow-md scale-[1.02]'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }`}
      >
        <Radio className="w-3.5 h-3.5" />
        <span>Easy German (Slow German)</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
          activeTrack === 'easy_german' ? 'bg-black/25 text-white' : 'bg-secondary/15 text-secondary'
        }`}>
          {easyGermanCount} tập
        </span>
      </button>
    </div>
  );
}
