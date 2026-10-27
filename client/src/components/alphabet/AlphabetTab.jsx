import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Volume2,
  Star,
  Sparkles,
  Flame,
  Search,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  CheckCircle2,
  X,
  BookOpen
} from 'lucide-react';
import { GERMAN_ALPHABET } from '../../data/germanAlphabetData';
import { speakWord, stopCurrentAudio } from '../../utils/pronunciationGuide';
import { getLocalDateString } from '../../utils/timeFormat';
import { getDailyFeaturedSounds } from '../../utils/alphabetReviewEngine';
import { getUserDaily5Progress, saveUserDaily5Progress } from '../../utils/userStorage';
import DailyReviewDrill from './DailyReviewDrill';
import AlphabetDetailModal from './AlphabetDetailModal';

export default function AlphabetTab({
  hardLetters = [],
  onToggleHardLetter,
  alphabetReviewProgress = {},
  onCompleteDailyReview,
  onCompleteDaily5Checkoff,
  currentUser
}) {
  const safeHardLetters = Array.isArray(hardLetters) ? hardLetters : [];
  const [activeFilter, setActiveFilter] = useState('daily5'); // 'daily5' | 'all' | 'standard' | 'umlaut' | 'cluster' | 'difficult' | 'starred'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDaily5QuizOpen, setIsDaily5QuizOpen] = useState(false);

  // Audio playing indicator state
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Auto-play all letters state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  const autoPlayTimerRef = useRef(null);

  const today = getLocalDateString();
  const isReviewedToday = alphabetReviewProgress?.lastReviewDate === today;
  const reviewStreak = alphabetReviewProgress?.reviewStreak || 0;

  // Daily 5 Featured Sounds Progress state (isolated per user)
  const [daily5Progress, setDaily5Progress] = useState(() => {
    const p = getUserDaily5Progress(currentUser?.username);
    if (p.date !== today) {
      return { date: today, completedSoundIds: [], customOffset: 0, isQuizCompleted: false };
    }
    return p;
  });

  // Sync daily 5 progress when user profile changes
  useEffect(() => {
    const p = getUserDaily5Progress(currentUser?.username);
    if (p.date !== today) {
      setDaily5Progress({ date: today, completedSoundIds: [], customOffset: 0, isQuizCompleted: false });
    } else {
      setDaily5Progress(p);
    }
  }, [currentUser?.username, today]);

  // Featured 5 sounds for today (deterministic per date, customizable offset)
  const featured5Sounds = useMemo(() => {
    return getDailyFeaturedSounds(today, daily5Progress.customOffset || 0, safeHardLetters);
  }, [today, daily5Progress.customOffset, safeHardLetters]);

  // Rotate / Shuffle Daily 5 sounds
  const handleRotateDaily5 = () => {
    setDaily5Progress(prev => {
      const nextOffset = (prev.customOffset || 0) + 1;
      const next = { ...prev, customOffset: nextOffset, completedSoundIds: [] };
      if (currentUser?.username) {
        saveUserDaily5Progress(currentUser.username, next);
      }
      return next;
    });
  };

  // Toggle completion of a daily 5 sound
  const handleToggleSoundCompleted = (e, soundId) => {
    e?.stopPropagation();
    setDaily5Progress(prev => {
      const currentCompleted = prev.completedSoundIds || [];
      const exists = currentCompleted.includes(soundId);
      const newIds = exists
        ? currentCompleted.filter(id => id !== soundId)
        : [...currentCompleted, soundId];
      const next = { ...prev, completedSoundIds: newIds };
      if (currentUser?.username) {
        saveUserDaily5Progress(currentUser.username, next);
      }
      if (!exists && newIds.length === 5 && onCompleteDaily5Checkoff) {
        onCompleteDaily5Checkoff(25);
      }
      return next;
    });
  };

  // Handle completion of daily 5 targeted quiz
  const handleCompleteDaily5Quiz = (results) => {
    setDaily5Progress(prev => {
      const allFeaturedIds = featured5Sounds.map(s => s.id);
      const next = { ...prev, isQuizCompleted: true, completedSoundIds: allFeaturedIds };
      if (currentUser?.username) {
        saveUserDaily5Progress(currentUser.username, next);
      }
      return next;
    });
    if (onCompleteDailyReview) {
      onCompleteDailyReview({
        ...results,
        isDaily5: true,
        xpEarned: 25
      });
    }
  };

  // Filtered letters list
  const filteredLetters = useMemo(() => {
    // If daily 5 filter is active, directly use the 5 featured sounds
    if (activeFilter === 'daily5') {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return featured5Sounds.filter(item => 
          item.letter.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.viApprox.toLowerCase().includes(q)
        );
      }
      return featured5Sounds;
    }

    return GERMAN_ALPHABET.filter((item) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchLetter = item.letter.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchVi = item.viApprox.toLowerCase().includes(q);
        const matchExamples = item.examples?.some(
          ex => ex.de.toLowerCase().includes(q) || ex.vi.toLowerCase().includes(q)
        );
        if (!matchLetter && !matchName && !matchVi && !matchExamples) {
          return false;
        }
      }

      // 2. Tab filter
      if (activeFilter === 'standard') return item.category === 'standard';
      if (activeFilter === 'umlaut') return item.category === 'umlaut';
      if (activeFilter === 'cluster') return item.category === 'cluster';
      if (activeFilter === 'difficult') return item.isDifficult;
      if (activeFilter === 'starred') return safeHardLetters.includes(item.id);

      return true; // 'all'
    });
  }, [activeFilter, searchQuery, safeHardLetters, featured5Sounds]);

  // Clean up auto-play timer and audio on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      stopCurrentAudio();
    };
  }, []);

  // Handle Auto-play sequential reading
  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      stopCurrentAudio();
      setIsAutoPlaying(false);
      setPlayingAudioId(null);
      return;
    }

    setIsAutoPlaying(true);
    let idx = 0;
    const playList = filteredLetters.length > 0 ? filteredLetters : GERMAN_ALPHABET;

    const playNext = async () => {
      if (idx >= playList.length) {
        setIsAutoPlaying(false);
        setPlayingAudioId(null);
        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
        return;
      }
      const item = playList[idx];
      setAutoPlayIndex(idx);
      setPlayingAudioId(item.id);
      await speakWord(item.ttsLetter || item.name, 'de', 0.85);
      idx++;
    };

    playNext();
    autoPlayTimerRef.current = setInterval(playNext, 1800);
  };

  // Play audio for a single item (Letter spelling name)
  const handlePlayLetter = async (e, item) => {
    e?.stopPropagation();
    setPlayingAudioId(item.id);
    try {
      await speakWord(item.ttsLetter || item.name, 'de', 0.85);
    } finally {
      setTimeout(() => setPlayingAudioId(null), 300);
    }
  };

  // Play audio for phonics sound (natural sound in words)
  const handlePlayPhonics = async (e, item) => {
    e?.stopPropagation();
    const soundKey = `phonics_${item.id}`;
    setPlayingAudioId(soundKey);
    try {
      const textToSpeak = item.phonicsAudio || item.ttsLetter || item.name;
      await speakWord(textToSpeak, 'de', 0.85);
    } finally {
      setTimeout(() => setPlayingAudioId(null), 300);
    }
  };

  // Play audio for an example word
  const handlePlayWord = async (e, word) => {
    e?.stopPropagation();
    setPlayingAudioId(word);
    try {
      await speakWord(word, 'de', 0.85);
    } finally {
      setTimeout(() => setPlayingAudioId(null), 300);
    }
  };

  // Toggle hard letter star
  const handleToggleStar = (e, letterId) => {
    e?.stopPropagation();
    if (onToggleHardLetter) {
      onToggleHardLetter(letterId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Daily Review Drill Modal / Overlay */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            stopCurrentAudio();
            setIsReviewModalOpen(false);
          }}
        >
          <div className="w-full max-w-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <DailyReviewDrill
              userStarredIds={safeHardLetters}
              currentUser={currentUser}
              onClose={() => {
                stopCurrentAudio();
                setIsReviewModalOpen(false);
              }}
              onComplete={(results) => {
                stopCurrentAudio();
                if (onCompleteDailyReview) {
                  onCompleteDailyReview(results);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Daily 5 Targeted Quiz Drill Modal */}
      {isDaily5QuizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            stopCurrentAudio();
            setIsDaily5QuizOpen(false);
          }}
        >
          <div className="w-full max-w-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <DailyReviewDrill
              userStarredIds={safeHardLetters}
              currentUser={currentUser}
              targetFeaturedSounds={featured5Sounds}
              drillTitle="🎯 Luyện tập 5 Âm Vị Tiêu Điểm Hôm Nay"
              rewardXp={25}
              onClose={() => {
                stopCurrentAudio();
                setIsDaily5QuizOpen(false);
              }}
              onComplete={(results) => {
                stopCurrentAudio();
                setIsDaily5QuizOpen(false);
                handleCompleteDaily5Quiz(results);
              }}
            />
          </div>
        </div>
      )}

      {/* Top Banner: Stats & Call-To-Action */}
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
                Tổng cộng: <strong className="text-on-surface">{GERMAN_ALPHABET.length}</strong> âm vị
              </span>
              <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20">
                Đã lưu cần ôn: <strong className="text-amber-400">{hardLetters.length}</strong> chữ
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
              onClick={handleToggleAutoPlay}
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
              onClick={() => setIsReviewModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>{isReviewedToday ? 'Ôn tập thêm (+XP)' : 'Ôn tập mỗi ngày (2p)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
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
            Tất cả ({GERMAN_ALPHABET.length})
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
            <span>Đã gắn sao ({safeHardLetters.length})</span>
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

      {/* Hero Focus Banner for Daily 5 Sounds */}
      {activeFilter === 'daily5' && (
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-surface-container-high/70 to-secondary/15 border border-primary/30 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-200 text-xs font-bold flex items-center gap-1">
                  <span>🎯</span>
                  <span>Mục tiêu ngày {today}</span>
                </span>
                {daily5Progress.completedSoundIds?.length === 5 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã hoàn thành hôm nay (+25 XP)</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-on-surface">
                5 Âm Vị Tiêu Điểm Ngày Hôm Nay
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5 max-w-xl">
                Hệ thống tự động chọn cân bằng chữ cái cơ bản và cụm âm khó để bạn ôn sâu mỗi ngày. Bấm tick xanh trên từng thẻ hoặc làm bài trắc nghiệm nhanh để nhận XP!
              </p>

              {/* Progress Bar & Counter */}
              <div className="flex items-center gap-3 mt-3">
                <div className="w-48 sm:w-60 bg-surface-container-low h-2 rounded-full overflow-hidden border border-outline-variant/30">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, ((daily5Progress.completedSoundIds?.length || 0) / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-secondary">
                  Đã ôn: {daily5Progress.completedSoundIds?.length || 0} / 5 âm ({Math.round(((daily5Progress.completedSoundIds?.length || 0) / 5) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleRotateDaily5}
                className="px-3.5 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
                title="Đổi sang 5 âm khác để luyện tập thêm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-secondary" />
                <span>Đổi 5 âm khác</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDaily5QuizOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Luyện tập 5 câu (+25 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alphabet Matrix Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredLetters.map((item, idx) => {
          const isStarred = safeHardLetters.includes(item.id);
          const isFeaturedToday = featured5Sounds.some(f => f.id === item.id);
          const isCompletedToday = daily5Progress.completedSoundIds?.includes(item.id);
          const isCurrentlyPlaying = isAutoPlaying && autoPlayIndex === idx;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedLetter(item);
                setVoiceFeedback(null);
              }}
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
                  onClick={(e) => handleToggleStar(e, item.id)}
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
                    onClick={(e) => handleToggleSoundCompleted(e, item.id)}
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
                  onClick={(e) => handlePlayLetter(e, item)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    playingAudioId === item.id
                      ? 'bg-secondary text-on-secondary ring-2 ring-secondary/50 scale-110 shadow-sm'
                      : 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface-variant'
                  }`}
                  title="Nghe tên chữ (Bấm vào thẻ để nghe cả âm ghép từ Phonics)"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === item.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLetters.length === 0 && (
        <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 my-6">
          <BookOpen className="w-10 h-10 text-outline mx-auto mb-3" />
          <h4 className="text-base font-bold text-on-surface mb-1">
            Không tìm thấy chữ cái phù hợp
          </h4>
          <p className="text-xs text-on-surface-variant">
            {activeFilter === 'starred'
              ? 'Bạn chưa gắn sao chữ cái nào. Hãy bấm biểu tượng ngôi sao ⭐ trên các chữ bạn muốn ôn tập!'
              : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc sang "Tất cả".'}
          </p>
        </div>
      )}

      {/* Detail Drawer / Modal for Selected Letter */}
      {selectedLetter && (
        <AlphabetDetailModal
          selectedLetter={selectedLetter}
          onClose={() => {
            stopCurrentAudio();
            setSelectedLetter(null);
          }}
          safeHardLetters={safeHardLetters}
          onToggleStar={handleToggleStar}
          featured5Sounds={featured5Sounds}
          daily5Progress={daily5Progress}
          onToggleSoundCompleted={handleToggleSoundCompleted}
          playingAudioId={playingAudioId}
          onPlayLetter={handlePlayLetter}
          onPlayPhonics={handlePlayPhonics}
          onPlayWord={handlePlayWord}
          onOpenReview={() => setIsReviewModalOpen(true)}
        />
      )}
    </div>
  );
}
