import React, { useState, useEffect, useRef } from 'react';
import Header from './components/common/Header';
import YouTubePlayer from './components/player/YouTubePlayer';
import DictationWorkspace from './components/dictation/DictationWorkspace';
import ShadowingWorkspace from './components/shadowing/ShadowingWorkspace';
import TranscriptList from './components/transcript/TranscriptList';
import WordPopover from './components/vocab/WordPopover';
import VocabNotebookModal from './components/vocab/VocabNotebookModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import StudyHistoryTab from './components/history/StudyHistoryTab';
import GamificationModal from './components/gamification/GamificationModal';
import RewardToast from './components/gamification/RewardToast';
import UserProfileModal from './components/user/UserProfileModal';
import { getGamificationData, recordLearningAction } from './utils/gamification';
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  getUserSettings,
  saveUserSettings,
  getUserSavedVocab,
  saveUserSavedVocab,
  getUserStudyHistory,
  saveUserStudyHistory,
  getUserCompletedSentences,
  saveUserCompletedSentences,
  deleteUserCompletedSentences,
  migrateLegacyDataIfApplicable
} from './utils/userStorage';
import { loadVideoApi } from './services/api';
import { PenTool, Mic, Sparkles, AlertCircle, History, RotateCcw } from 'lucide-react';

export default function App() {
  // Main Navigation Tab: 'studio' | 'history'
  const [mainTab, setMainTab] = useState('studio');

  // User Profile & Settings State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isUserModalOpen, setIsUserModalOpen] = useState(() => !getCurrentUser());
  const [userSettings, setUserSettings] = useState(() => {
    const user = getCurrentUser();
    return getUserSettings(user?.username);
  });

  const [currentVideo, setCurrentVideo] = useState(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState(() => userSettings.activeMode || 'dictation'); // 'dictation' | 'shadowing'
  const [currentLanguage, setCurrentLanguage] = useState(() => userSettings.selectedLang || 'de'); // 'de' | 'en'
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Modals & Popovers
  const [selectedWord, setSelectedWord] = useState(null);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [activeReward, setActiveReward] = useState(null);

  // Gamification state (per user)
  const [gamificationData, setGamificationData] = useState(() => getGamificationData(currentUser?.username));

  // User-scoped storage states
  const [savedWords, setSavedWords] = useState(() => getUserSavedVocab(currentUser?.username));
  const [completedSentenceIds, setCompletedSentenceIds] = useState(() => new Set());
  const [studyHistory, setStudyHistory] = useState(() => getUserStudyHistory(currentUser?.username));

  const playerRef = useRef(null);

  // Save user-scoped data to storage when updated
  useEffect(() => {
    if (currentUser?.username) {
      saveUserSavedVocab(currentUser.username, savedWords);
    }
  }, [savedWords, currentUser?.username]);

  useEffect(() => {
    if (currentUser?.username && currentVideo?.videoId) {
      saveUserCompletedSentences(currentUser.username, currentVideo.videoId, completedSentenceIds);
    }
  }, [completedSentenceIds, currentVideo?.videoId, currentUser?.username]);

  useEffect(() => {
    if (currentUser?.username) {
      saveUserStudyHistory(currentUser.username, studyHistory);
    }
  }, [studyHistory, currentUser?.username]);

  // Handle switching or selecting user profile
  const handleSelectUser = (user) => {
    if (!user || !user.username) return;

    persistCurrentUser(user);
    setCurrentUser(user);
    migrateLegacyDataIfApplicable(user.username);

    // 1. Load user settings & toggles
    const loadedSettings = getUserSettings(user.username);
    setUserSettings(loadedSettings);
    setCurrentLanguage(loadedSettings.selectedLang || 'de');
    setStudyMode(loadedSettings.activeMode || 'dictation');

    // 2. Load user's saved vocabulary notebook
    const userVocab = getUserSavedVocab(user.username);
    setSavedWords(userVocab);

    // 3. Load user's study history
    const userHistory = getUserStudyHistory(user.username);
    setStudyHistory(userHistory);

    // 4. Load user's completed sentences for current video
    if (currentVideo?.videoId) {
      const userCompleted = getUserCompletedSentences(user.username, currentVideo.videoId);
      setCompletedSentenceIds(userCompleted);
      updateStudyHistory(currentVideo, userCompleted.size, user.username);
    } else {
      setCompletedSentenceIds(new Set());
    }

    // 5. Load user's gamification stats (Streak, XP, Badges)
    const userGamification = getGamificationData(user.username);
    setGamificationData(userGamification);

    // 6. Close modal & show friendly toast
    setIsUserModalOpen(false);
    setActiveReward({
      icon: user.avatar || '🦊',
      title: `Xin chào, ${user.username}!`,
      message: `Đã khôi phục cài đặt riêng và tiến độ học của bạn.`,
      xpGained: 0
    });
  };

  // Toggle handlers that persist per user
  const handleToggleBlur = (newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, isBlurScript: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { isBlurScript: newVal });
      }
      return next;
    });
  };

  const handleToggleGenderColors = (newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, showGenderColors: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { showGenderColors: newVal });
      }
      return next;
    });
  };

  const handleChangeMode = (mode) => {
    setStudyMode(mode);
    setUserSettings((prev) => {
      const next = { ...prev, activeMode: mode };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { activeMode: mode });
      }
      return next;
    });
  };

  // Update study history item (per user)
  const updateStudyHistory = (videoData, completedCount, username = currentUser?.username) => {
    if (!videoData) return;
    setStudyHistory((prev) => {
      const filtered = prev.filter((h) => h.videoId !== videoData.videoId);
      const updatedItem = {
        videoId: videoData.videoId,
        title: videoData.title,
        author: videoData.author,
        thumbnail: videoData.thumbnail,
        language: videoData.language,
        totalSentences: videoData.sentences?.length || 0,
        completedCount: typeof completedCount === 'number' ? completedCount : completedSentenceIds.size,
        lastStudiedAt: new Date().toISOString()
      };
      const nextHistory = [updatedItem, ...filtered];
      if (username) {
        saveUserStudyHistory(username, nextHistory);
      }
      return nextHistory;
    });
  };

  // Auto-resume last studied video on initial mount if available
  useEffect(() => {
    if (!currentVideo && studyHistory && studyHistory.length > 0) {
      handleLoadVideo(studyHistory[0].videoId, studyHistory[0].language);
    }
  }, []);

  // Load video handler
  const handleLoadVideo = async (urlOrId, lang = currentLanguage, resetProgress = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await loadVideoApi(urlOrId, lang);
      setCurrentVideo(data);
      setCurrentLanguage(data.language || lang);
      setActiveSegmentIndex(0);
      setIsLooping(false);
      setResetTrigger((prev) => prev + 1);

      if (resetProgress) {
        setCompletedSentenceIds(new Set());
        if (currentUser?.username) {
          deleteUserCompletedSentences(currentUser.username, data.videoId);
        }
        updateStudyHistory(data, 0);
      } else {
        // Restore completed sentences for this user and this specific video
        const userCompleted = currentUser?.username
          ? getUserCompletedSentences(currentUser.username, data.videoId)
          : new Set();
        setCompletedSentenceIds(userCompleted);
        updateStudyHistory(data, userCompleted.size);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tải video hoặc phụ đề');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset current lesson from beginning
  const handleResetLesson = (confirmed = false) => {
    if (!currentVideo) return;

    if (!confirmed && completedSentenceIds.size > 0) {
      const isSure = window.confirm(
        `Bạn có chắc chắn muốn làm lại bài học "${currentVideo.title}" từ đầu không?\n\n• Tiến độ (${completedSentenceIds.size} câu đã hoàn thành) sẽ được đặt lại về 0\n• Toàn bộ các câu phụ đề sẽ được làm mờ lại\n• Quay trở về câu số 1`
      );
      if (!isSure) return;
    }

    // 1. Reset completed sentences for this video & user
    setCompletedSentenceIds(new Set());
    if (currentUser?.username) {
      deleteUserCompletedSentences(currentUser.username, currentVideo.videoId);
    }

    // 2. Reset active segment to first sentence
    setActiveSegmentIndex(0);
    setIsLooping(false);
    setResetTrigger((prev) => prev + 1);

    // 3. Pause & rewind player to start of sentence 1
    if (playerRef.current && currentVideo.sentences?.[0]) {
      playerRef.current.seekTo(currentVideo.sentences[0].start);
      playerRef.current.pause();
    }

    // 4. Update study history progress to 0 completed sentences
    updateStudyHistory(currentVideo, 0);
  };

  // Reset lesson from Study History Tab
  const handleResetLessonFromHistory = (lesson) => {
    if (currentVideo?.videoId === lesson.videoId) {
      handleResetLesson(true);
    } else {
      if (currentUser?.username) {
        deleteUserCompletedSentences(currentUser.username, lesson.videoId);
      }
      setStudyHistory((prev) =>
        prev.map((h) => (h.videoId === lesson.videoId ? { ...h, completedCount: 0 } : h))
      );
      handleLoadVideo(lesson.videoId, lesson.language, true);
    }
    setMainTab('studio');
  };

  const activeSegment = currentVideo?.sentences?.[activeSegmentIndex] || null;

  // Handle sentence navigation
  const handleNextSegment = () => {
    if (!currentVideo || !currentVideo.sentences) return;
    if (activeSegmentIndex < currentVideo.sentences.length - 1) {
      const nextIdx = activeSegmentIndex + 1;
      setActiveSegmentIndex(nextIdx);
      if (playerRef.current) {
        playerRef.current.seekTo(currentVideo.sentences[nextIdx].start);
        playerRef.current.play();
      }
    }
  };

  const handlePrevSegment = () => {
    if (!currentVideo || !currentVideo.sentences) return;
    if (activeSegmentIndex > 0) {
      const prevIdx = activeSegmentIndex - 1;
      setActiveSegmentIndex(prevIdx);
      if (playerRef.current) {
        playerRef.current.seekTo(currentVideo.sentences[prevIdx].start);
        playerRef.current.play();
      }
    }
  };

  const handleSelectSegment = (segment) => {
    const idx = currentVideo.sentences.findIndex((s) => s.id === segment.id);
    if (idx !== -1) {
      setActiveSegmentIndex(idx);
      if (playerRef.current) {
        playerRef.current.seekTo(segment.start);
        playerRef.current.play();
      }
    }
  };

  const handleReplaySegment = () => {
    if (playerRef.current && activeSegment) {
      playerRef.current.seekTo(activeSegment.start);
      playerRef.current.play();
    }
  };

  const handleReplaySlow = () => {
    if (playerRef.current && activeSegment) {
      setPlaybackSpeed(0.75);
      playerRef.current.seekTo(activeSegment.start);
      playerRef.current.play();
    }
  };

  const handleCompleteSentence = (sentenceId, score, mode = studyMode) => {
    setCompletedSentenceIds((prev) => {
      const next = new Set([...prev, sentenceId]);
      if (currentVideo) {
        updateStudyHistory(currentVideo, next.size);
      }
      return next;
    });

    // Gamification action
    let action = 'COMPLETE_DICTATION';
    if (mode === 'dictation' && score === 100) action = 'PERFECT_DICTATION';
    if (mode === 'shadowing') action = 'COMPLETE_SHADOWING';

    const result = recordLearningAction(action, { score }, currentUser?.username);
    setGamificationData(result.updatedData);

    // Trigger Reward Toast
    if (result.leveledUp) {
      setActiveReward({
        icon: '👑',
        title: `Lên Level ${result.newLevel.level}!`,
        message: `Chúc mừng bạn đã đạt danh hiệu "${result.newLevel.title}"!`,
        xpGained: result.xpGained
      });
    } else if (result.goalReached) {
      setActiveReward({
        icon: '🎯',
        title: 'Mục tiêu hoàn thành!',
        message: 'Bạn đã đạt 100% mục tiêu học hôm nay (+30 XP thưởng)!',
        xpGained: result.xpGained
      });
    } else if (result.newBadges?.length > 0) {
      setActiveReward({
        icon: '🏆',
        title: 'Mở khóa Huy hiệu mới!',
        message: 'Bạn vừa đạt được huy hiệu thành tích mới!',
        xpGained: result.xpGained
      });
    } else if (result.xpGained > 0) {
      setActiveReward({
        icon: score === 100 ? '🎯' : '⚡',
        title: score === 100 ? 'Chính xác 100%!' : 'Hoàn thành câu!',
        message: `Bạn được cộng +${result.xpGained} XP kinh nghiệm`,
        xpGained: result.xpGained
      });
    }
  };

  // Word lookup popup
  const handleWordClick = (word) => {
    setSelectedWord({
      word,
      context: activeSegment?.text || ''
    });
  };

  // Save word to notebook
  const handleSaveWord = ({ word, language, context, nounInfo }) => {
    const exists = savedWords.some((w) => w.word.toLowerCase() === word.toLowerCase());
    let nextWords = [];
    if (exists) {
      nextWords = savedWords.filter((w) => w.word.toLowerCase() !== word.toLowerCase());
    } else {
      nextWords = [
        { word, language, context, nounInfo, savedAt: new Date().toISOString() },
        ...savedWords
      ];
      // Reward XP for saving word
      const result = recordLearningAction('SAVE_VOCAB', { vocabCount: nextWords.length }, currentUser?.username);
      setGamificationData(result.updatedData);
    }
    setSavedWords(nextWords);
  };

  const handleRemoveWord = (word) => {
    setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== word.toLowerCase()));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#dfe2f0] font-sans flex flex-col relative selection:bg-primary selection:text-on-primary overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(128,131,255,0.12),rgba(255,255,255,0))]"></div>
      <div className="pointer-events-none fixed -top-32 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[140px]"></div>

      {/* Top Navigation */}
      <Header
        activeTab={mainTab}
        onChangeTab={setMainTab}
        onLoadVideo={handleLoadVideo}
        isLoading={isLoading}
        currentLanguage={currentLanguage}
        onChangeLanguage={(lang) => {
          setCurrentLanguage(lang);
          if (currentUser?.username) {
            saveUserSettings(currentUser.username, { selectedLang: lang });
          }
          if (currentVideo) {
            handleLoadVideo(currentVideo.videoId, lang);
          }
        }}
        onOpenVocab={() => setIsVocabOpen(true)}
        savedVocabCount={savedWords.length}
        historyCount={studyHistory.length}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        gamificationData={gamificationData}
        onOpenGamification={() => setIsGamificationOpen(true)}
        currentUser={currentUser}
        onOpenUserProfile={() => setIsUserModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-error-container/30 border border-error/50 flex items-center justify-between gap-3 text-error text-xs animate-shake">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-error shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-outline hover:text-on-surface cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* TAB 1: DEDICATED STUDY HISTORY TAB */}
        {mainTab === 'history' ? (
          <StudyHistoryTab
            history={studyHistory}
            onSelectLesson={(lesson) => {
              handleLoadVideo(lesson.videoId, lesson.language);
              setMainTab('studio');
            }}
            onResetLesson={handleResetLessonFromHistory}
            onRemoveLesson={(id) => setStudyHistory((prev) => prev.filter((h) => h.videoId !== id))}
            onClearHistory={() => setStudyHistory([])}
            onBackToStudio={() => setMainTab('studio')}
            hasActiveVideo={Boolean(currentVideo)}
          />
        ) : (
          /* TAB 2: STUDIO WORKSPACE */
          <>
            {/* Video Lesson Bar */}
            {currentVideo && (
              <div className="mb-5 w-full rounded-2xl bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] px-2 py-0.2 rounded-md font-bold bg-secondary-container/20 text-secondary border border-secondary/30">
                      {currentLanguage === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
                    </span>
                    <span className="text-xs text-outline font-medium truncate">
                      {currentVideo.author}
                    </span>
                  </div>
                  <h1 className="text-sm sm:text-base font-headline font-semibold text-on-surface truncate" title={currentVideo.title}>
                    {currentVideo.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-outline mt-1 font-medium">
                    <span>Câu <strong className="text-on-surface">{activeSegmentIndex + 1}</strong> / {currentVideo.sentences?.length || 0}</span>
                    <span className="text-outline-variant">•</span>
                    <span>Đã học: <strong className="text-secondary font-semibold">{completedSentenceIds.size}</strong></span>
                    {currentVideo.sentences?.length > 0 && (
                      <span className="text-[11px] font-mono text-outline">
                        ({Math.round((completedSentenceIds.size / currentVideo.sentences.length) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Reset button & Mode Switcher */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleResetLesson()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-error-container/20 text-outline hover:text-error border border-outline-variant/30 hover:border-error/40 rounded-full text-xs font-medium transition-all cursor-pointer shadow-xs"
                    title="Làm lại bài học này từ đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Làm lại bài</span>
                  </button>

                  {/* Segmented Mode Switcher */}
                  <div className="flex items-center p-0.5 bg-surface-container-low border border-outline-variant/40 rounded-full shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleChangeMode('dictation')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        studyMode === 'dictation'
                          ? 'bg-primary-container text-on-primary-container shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Nghe chép</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeMode('shadowing')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        studyMode === 'shadowing'
                          ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Nói đuổi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Two-Column Studio Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Player & Study Workspace (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {currentVideo ? (
                  <>
                    <YouTubePlayer
                      ref={playerRef}
                      videoId={currentVideo.videoId}
                      activeSegment={activeSegment}
                      isLooping={isLooping}
                      playbackSpeed={playbackSpeed}
                      onChangeSpeed={setPlaybackSpeed}
                      onTimeUpdate={setCurrentTime}
                      autoPauseAtSegmentEnd={!isLooping}
                      onNextSegment={handleNextSegment}
                      onPrevSegment={handlePrevSegment}
                      language={currentLanguage}
                    />

                    {studyMode === 'dictation' ? (
                      <DictationWorkspace
                        key={`dict-${activeSegment?.id || 'seg'}-${resetTrigger}`}
                        activeSegment={activeSegment}
                        segmentIndex={activeSegmentIndex}
                        totalSegments={currentVideo.sentences?.length || 0}
                        onNextSegment={handleNextSegment}
                        onPrevSegment={handlePrevSegment}
                        onReplaySegment={handleReplaySegment}
                        onReplaySlow={handleReplaySlow}
                        isLooping={isLooping}
                        onToggleLoop={() => setIsLooping(!isLooping)}
                        language={currentLanguage}
                        onCompleteSentence={handleCompleteSentence}
                      />
                    ) : (
                      <ShadowingWorkspace
                        key={`shad-${activeSegment?.id || 'seg'}-${resetTrigger}`}
                        activeSegment={activeSegment}
                        segmentIndex={activeSegmentIndex}
                        totalSegments={currentVideo.sentences?.length || 0}
                        onNextSegment={handleNextSegment}
                        onPrevSegment={handlePrevSegment}
                        onReplaySegment={handleReplaySegment}
                        language={currentLanguage}
                        onCompleteSentence={handleCompleteSentence}
                      />
                    )}
                  </>
                ) : (
                  <div className="p-10 text-center rounded-2xl bg-surface-container/70 border border-outline-variant/30 space-y-3 shadow-xl backdrop-blur-xl">
                    <Sparkles className="w-10 h-10 text-secondary mx-auto animate-bounce" />
                    <h2 className="text-lg font-headline font-bold text-on-surface">
                      Bắt đầu bài học của bạn
                    </h2>
                    <p className="text-xs text-outline max-w-md mx-auto leading-relaxed">
                      Dán link bất kỳ từ YouTube vào ô tìm kiếm ở trên để bắt đầu nghe chép chính tả và luyện nói đuổi ngay.
                    </p>
                    {studyHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMainTab('history')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container-high hover:bg-surface-bright text-secondary font-semibold text-xs rounded-full border border-outline-variant/30 transition-all cursor-pointer shadow-xs"
                      >
                        <History className="w-3.5 h-3.5 text-primary" />
                        <span>Xem lại lịch sử học tập ({studyHistory.length} bài)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Transcript & Click-to-lookup (5 cols) */}
              <div className="lg:col-span-5">
                <TranscriptList
                  sentences={currentVideo?.sentences || []}
                  activeSegmentId={activeSegment?.id}
                  onSelectSegment={handleSelectSegment}
                  onWordClick={handleWordClick}
                  completedSentenceIds={completedSentenceIds}
                  currentTime={currentTime}
                  language={currentLanguage}
                  onResetLesson={() => handleResetLesson()}
                  isBlurScript={userSettings.isBlurScript}
                  onToggleBlur={handleToggleBlur}
                  showGenderColors={userSettings.showGenderColors}
                  onToggleGenderColors={handleToggleGenderColors}
                />
              </div>

            </div>
          </>
        )}

      </main>

      {/* Popovers & Modals */}
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        canClose={Boolean(currentUser)}
      />

      {/* Word Popover */}
      {selectedWord && (
        <WordPopover
          word={selectedWord.word}
          language={currentLanguage}
          contextSentence={selectedWord.context}
          isSaved={savedWords.some((w) => w.word.toLowerCase() === selectedWord.word.toLowerCase())}
          onClose={() => setSelectedWord(null)}
          onSaveWord={handleSaveWord}
        />
      )}

      {/* Sổ từ vựng Modal */}
      <VocabNotebookModal
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        savedWords={savedWords}
        onRemoveWord={handleRemoveWord}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Gamification Dashboard Modal */}
      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
        gamificationData={gamificationData}
        onUpdateData={(updated) => setGamificationData(updated)}
        currentUser={currentUser}
      />

      {/* Floating Reward Notification Toast */}
      {activeReward && (
        <RewardToast
          reward={activeReward}
          onDismiss={() => setActiveReward(null)}
        />
      )}

    </div>
  );
}
