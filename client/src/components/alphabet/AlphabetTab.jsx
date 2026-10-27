import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Star,
  Flame,
  Play,
  Pause,
  Trophy,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { GERMAN_ALPHABET } from '../../data/germanAlphabetData';
import { speakWord, stopCurrentAudio } from '../../utils/pronunciationGuide';
import { getLocalDateString } from '../../utils/timeFormat';
import { getDailyFeaturedSounds } from '../../utils/alphabetReviewEngine';
import { getUserDaily5Progress, saveUserDaily5Progress } from '../../utils/userStorage';
import DailyReviewDrill from './DailyReviewDrill';
import AlphabetDetailModal from './AlphabetDetailModal';
import AlphabetHeroBanner from './AlphabetHeroBanner';
import Daily5Banner from './Daily5Banner';
import AlphabetFilterBar from './AlphabetFilterBar';
import LetterCard from './LetterCard';

export default function AlphabetTab({
  hardLetters = [],
  onToggleHardLetter,
  alphabetReviewProgress = {},
  onCompleteDailyReview,
  onCompleteDaily5Checkoff,
  currentUser
}) {
  const safeHardLetters = Array.isArray(hardLetters) ? hardLetters : [];
  const [activeFilter, setActiveFilter] = useState('daily5');
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

  // Daily 5 Featured Sounds State
  const [daily5RotationOffset, setDaily5RotationOffset] = useState(0);
  const featured5Sounds = useMemo(() => {
    return getDailyFeaturedSounds(today, daily5RotationOffset, safeHardLetters);
  }, [today, daily5RotationOffset, safeHardLetters]);

  // Daily 5 Progress persisted per user profile
  const [daily5Progress, setDaily5Progress] = useState(() => {
    return getUserDaily5Progress(currentUser, today);
  });

  useEffect(() => {
    setDaily5Progress(getUserDaily5Progress(currentUser, today));
  }, [currentUser, today]);

  // Cleanup audio & timer on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, []);

  // Filter letters based on active tab & search query
  const filteredLetters = useMemo(() => {
    let list = GERMAN_ALPHABET;

    if (activeFilter === 'daily5') {
      const featuredIds = new Set(featured5Sounds.map(f => f.id));
      list = GERMAN_ALPHABET.filter(item => featuredIds.has(item.id));
    } else if (activeFilter === 'standard') {
      list = list.filter(item => item.category === 'standard');
    } else if (activeFilter === 'umlaut') {
      list = list.filter(item => item.category === 'umlaut');
    } else if (activeFilter === 'cluster') {
      list = list.filter(item => item.category === 'cluster');
    } else if (activeFilter === 'difficult') {
      list = list.filter(item => item.isDifficult);
    } else if (activeFilter === 'starred') {
      list = list.filter(item => safeHardLetters.includes(item.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        item =>
          item.letter.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.ipa.toLowerCase().includes(q) ||
          item.viApprox.toLowerCase().includes(q) ||
          item.examples?.some(ex => ex.de.toLowerCase().includes(q) || ex.vi.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeFilter, searchQuery, safeHardLetters, featured5Sounds]);

  // Play letter name audio (Đánh vần)
  const handlePlayLetter = (e, item) => {
    if (e) e.stopPropagation();
    setPlayingAudioId(`letter_${item.id}`);
    speakWord(item.ttsLetter || item.name, 'de', 0.85)
      .finally(() => setPlayingAudioId(null));
  };

  // Play phonics audio (Âm vị tự nhiên khi ghép vào từ vựng)
  const handlePlayPhonics = (e, item) => {
    if (e) e.stopPropagation();
    const soundText = item.phonicsAudio || item.ttsLetter || item.name;
    setPlayingAudioId(`phonics_${item.id}`);
    speakWord(soundText, 'de', 0.85)
      .finally(() => setPlayingAudioId(null));
  };

  // Play word example
  const handlePlayWord = (e, word) => {
    if (e) e.stopPropagation();
    setPlayingAudioId(word);
    speakWord(word, 'de', 0.85)
      .finally(() => setPlayingAudioId(null));
  };

  // Toggle hard letter star
  const handleToggleStar = (e, letterId) => {
    if (e) e.stopPropagation();
    if (onToggleHardLetter) {
      onToggleHardLetter(letterId);
    }
  };

  // Toggle completed checkmark for Daily 5 item
  const handleToggleSoundCompleted = (e, soundId) => {
    if (e) e.stopPropagation();
    const currentList = daily5Progress.completedSoundIds || [];
    const isCompleted = currentList.includes(soundId);
    const updatedList = isCompleted
      ? currentList.filter(id => id !== soundId)
      : [...currentList, soundId];

    const updatedProgress = {
      date: today,
      completedSoundIds: updatedList,
      isFullyCompleted: updatedList.length === 5,
      completedAt: updatedList.length === 5 ? new Date().toISOString() : daily5Progress.completedAt
    };

    setDaily5Progress(updatedProgress);
    saveUserDaily5Progress(currentUser, updatedProgress);

    if (updatedList.length === 5 && !daily5Progress.isFullyCompleted && onCompleteDaily5Checkoff) {
      onCompleteDaily5Checkoff(updatedProgress);
    }
  };

  const handleRotateDaily5 = () => {
    setDaily5RotationOffset(prev => prev + 1);
  };

  const handleCompleteDaily5Quiz = (quizResults) => {
    const allIds = featured5Sounds.map(f => f.id);
    const updatedProgress = {
      date: today,
      completedSoundIds: allIds,
      isFullyCompleted: true,
      completedAt: new Date().toISOString()
    };
    setDaily5Progress(updatedProgress);
    saveUserDaily5Progress(currentUser, updatedProgress);

    if (onCompleteDaily5Checkoff) {
      onCompleteDaily5Checkoff(updatedProgress, quizResults);
    }
  };

  // Auto-play loop logic
  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      stopCurrentAudio();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    } else {
      setIsAutoPlaying(true);
      setAutoPlayIndex(0);
      playLetterSequentially(0);
    }
  };

  const playLetterSequentially = (index) => {
    const letters = GERMAN_ALPHABET.filter(item => item.category === 'standard');
    if (index >= letters.length) {
      setIsAutoPlaying(false);
      return;
    }

    const currentItem = letters[index];
    setAutoPlayIndex(index);
    setPlayingAudioId(`phonics_${currentItem.id}`);

    const soundText = currentItem.phonicsAudio || currentItem.ttsLetter || currentItem.name;
    speakWord(soundText, 'de', 0.85)
      .finally(() => {
        setPlayingAudioId(null);
        autoPlayTimerRef.current = setTimeout(() => {
          playLetterSequentially(index + 1);
        }, 800);
      });
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
      <AlphabetHeroBanner
        reviewStreak={reviewStreak}
        totalAlphabetCount={GERMAN_ALPHABET.length}
        hardLettersCount={hardLetters.length}
        isReviewedToday={isReviewedToday}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={handleToggleAutoPlay}
        onOpenReview={() => setIsReviewModalOpen(true)}
      />

      {/* Filter Tabs & Search Bar */}
      <AlphabetFilterBar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        daily5Progress={daily5Progress}
        totalAlphabetCount={GERMAN_ALPHABET.length}
        safeHardLettersCount={safeHardLetters.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Focus Banner for Daily 5 Sounds */}
      {activeFilter === 'daily5' && (
        <Daily5Banner
          today={today}
          daily5Progress={daily5Progress}
          onRotateDaily5={handleRotateDaily5}
          onOpenDaily5Quiz={() => setIsDaily5QuizOpen(true)}
        />
      )}

      {/* Alphabet Matrix Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredLetters.map((item, idx) => (
          <LetterCard
            key={item.id}
            item={item}
            idx={idx}
            isStarred={safeHardLetters.includes(item.id)}
            isFeaturedToday={featured5Sounds.some(f => f.id === item.id)}
            isCompletedToday={daily5Progress.completedSoundIds?.includes(item.id)}
            isCurrentlyPlaying={isAutoPlaying && autoPlayIndex === idx}
            activeFilter={activeFilter}
            playingAudioId={playingAudioId}
            onSelect={(selected) => setSelectedLetter(selected)}
            onToggleStar={handleToggleStar}
            onToggleSoundCompleted={handleToggleSoundCompleted}
            onPlayLetter={handlePlayPhonics}
          />
        ))}
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
