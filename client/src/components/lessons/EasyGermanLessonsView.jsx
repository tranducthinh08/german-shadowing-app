import React, { useState, useMemo } from 'react';
import { Play, Search, Radio, CheckCircle2 } from 'lucide-react';
import { EASY_GERMAN_PLAYLIST } from '../../data/easyGermanPlaylist.js';
import LessonEpisodeCard from './LessonEpisodeCard';

export default function EasyGermanLessonsView({
  onSelectEpisode,
  completedVideoIds = [],
  practiceCounts = {},
  currentVideoId = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: `Tất cả (${EASY_GERMAN_PLAYLIST.totalEpisodes})` },
    { id: 'Giao tiếp cơ bản', label: 'Giao tiếp cơ bản' },
    { id: 'Từ vựng đời sống', label: 'Từ vựng đời sống' },
    { id: 'Phát âm & Bảng chữ cái', label: 'Phát âm' },
    { id: 'Động từ & Ngữ pháp', label: 'Động từ & Ngữ pháp' },
    { id: 'Đời sống & Mua sắm', label: 'Đời sống & Mua sắm' }
  ];

  const filteredEpisodes = useMemo(() => {
    let list = EASY_GERMAN_PLAYLIST.episodes;

    if (selectedCategory !== 'all') {
      list = list.filter((ep) => ep.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (ep) =>
          (ep.title && ep.title.toLowerCase().includes(q)) ||
          (ep.fullTitle && ep.fullTitle.toLowerCase().includes(q)) ||
          (ep.category && ep.category.toLowerCase().includes(q)) ||
          (ep.episodeNumber && ep.episodeNumber.toString() === q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Easy German Header Info Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-secondary text-on-secondary">
              EASY GERMAN A1
            </span>
            <h2 className="text-sm sm:text-base font-headline font-bold text-on-surface">
              German A1 | For Absolute Beginners (10 tập nền tảng)
            </h2>
          </div>
          <p className="text-xs text-outline">
            Học tiếng Đức đời thực ngoài đường phố Berlin qua giọng nói chậm, phát âm rõ ràng và từ vựng hội thoại thiết yếu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const ep1 = EASY_GERMAN_PLAYLIST.episodes[0];
            if (ep1) onSelectEpisode(ep1);
          }}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-on-primary font-bold text-xs shadow-md shadow-secondary/20 hover:scale-105 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Bắt đầu từ Tập 1</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo số tập hoặc chủ đề (VD: Introduce, Objects, Machen)..."
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

          <div className="text-xs text-outline flex items-center gap-2">
            Hiển thị <span className="font-bold text-on-surface">{filteredEpisodes.length}</span> / {EASY_GERMAN_PLAYLIST.episodes.length} tập
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-high hover:bg-surface-bright text-on-surface-variant'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEpisodes.map((ep) => {
          const isDone = completedVideoIds.includes(ep.videoId);
          const practiceCount = practiceCounts[ep.videoId] || (isDone ? 1 : 0);
          const isCurrent = currentVideoId === ep.videoId;

          return (
            <LessonEpisodeCard
              key={ep.id}
              ep={ep}
              isCompleted={isDone}
              practiceCount={practiceCount}
              isCurrent={isCurrent}
              onSelectEpisode={onSelectEpisode}
            />
          );
        })}
      </div>
    </div>
  );
}
