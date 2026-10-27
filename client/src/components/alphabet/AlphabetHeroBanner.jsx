import React from 'react';
import { Flame, Star, CheckCircle2, Pause, Play, Trophy } from 'lucide-react';

export default function AlphabetHeroBanner({
  reviewStreak = 0,
  totalAlphabetCount = 0,
  hardLettersCount = 0,
  isReviewedToday = false,
  isAutoPlaying = false,
  onToggleAutoPlay,
  onOpenReview
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container-high/90 via-surface-container/70 to-surface-container-high/90 border border-outline-variant/30 p-6 sm:p-8 mb-8 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center gap-1.5 border border-secondary/20">
              <span>🇩🇪</span>
              <span>Bảng chữ cái tiếng Đức • Deutsches Alphabet</span>
            </span>
            {reviewStreak > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{reviewStreak} ngày streak</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-headline text-on-surface tracking-tight mb-2">
            Làm chủ 26 Chữ cái & Các Cặp Âm Khó Tiếng Đức
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Bấm vào từng chữ để nghe phát âm chuẩn, xem mẹo khẩu hình miệng và các lỗi người Việt hay gặp nhất. Đánh dấu <Star className="w-3.5 h-3.5 inline text-amber-400 fill-amber-400" /> các chữ khó để đưa vào bài ôn tập hàng ngày!
          </p>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
            <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20">
              Tổng cộng: <strong className="text-on-surface">{totalAlphabetCount}</strong> âm vị
            </span>
            <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20">
              Đã lưu cần ôn: <strong className="text-amber-400">{hardLettersCount}</strong> chữ
            </span>
            <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20 flex items-center gap-1.5">
              {isReviewedToday ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Hôm nay đã hoàn thành ôn tập</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-300 font-semibold">Chưa ôn tập hôm nay</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              isAutoPlaying
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-surface-container-low border-outline-variant/40 hover:bg-surface-container-high text-on-surface'
            }`}
            title="Nghe tự động lần lượt các chữ cái"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4 text-rose-400" /> : <Play className="w-4 h-4 text-secondary" />}
            <span>{isAutoPlaying ? 'Dừng đọc tự động' : 'Đọc tự động A - Z'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReview}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>{isReviewedToday ? 'Ôn tập thêm (+XP)' : 'Ôn tập mỗi ngày (2p)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
