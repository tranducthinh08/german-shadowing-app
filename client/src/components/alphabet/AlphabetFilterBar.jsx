import React from 'react';
import { Flame, Star, Search, X } from 'lucide-react';

export default function AlphabetFilterBar({
  activeFilter,
  setActiveFilter,
  daily5Progress = {},
  totalAlphabetCount = 0,
  safeHardLettersCount = 0,
  searchQuery,
  setSearchQuery
}) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveFilter('daily5')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'daily5'
              ? 'bg-gradient-to-r from-primary to-secondary text-on-primary shadow-md'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          <span>🎯 5 Âm hôm nay</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            daily5Progress.completedSoundIds?.length === 5
              ? 'bg-emerald-500/30 text-emerald-300'
              : 'bg-white/15 text-on-surface'
          }`}>
            {daily5Progress.completedSoundIds?.length || 0}/5
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          Tất cả ({totalAlphabetCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('standard')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'standard'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          26 Chữ cái A-Z
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('umlaut')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'umlaut'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          Umlaute & Eszett (Ä, Ö, Ü, ß)
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('cluster')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeFilter === 'cluster'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          Cặp âm ghép (ei, ie, ch...)
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('difficult')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
            activeFilter === 'difficult'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Chữ khó 🔥</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('starred')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
            activeFilter === 'starred'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Đã gắn sao ({safeHardLettersCount})</span>
        </button>
      </div>

      {/* Search Box */}
      <div className="relative min-w-[220px]">
        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm chữ, IPA hoặc từ mẫu..."
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
