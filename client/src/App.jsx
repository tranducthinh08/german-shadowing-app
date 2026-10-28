import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/common/Header';
import AppSidebar from './components/navigation/AppSidebar';
import StudioWorkspace from './components/studio/StudioWorkspace';
import AppModals from './components/common/AppModals';
import { useUserSession } from './hooks/useUserSession';
import { useGamificationSession } from './hooks/useGamificationSession';
import { useVideoSession } from './hooks/useVideoSession';
import {
  setCurrentUser as persistCurrentUser, getUserSettings, saveUserSettings,
  getUserSavedVocab, getUserStudyHistory, getUserCompletedSentences,
  saveUserCompletedSentences, deleteUserCompletedSentences, getUserHardLetters,
  getUserAlphabetReviewProgress, migrateLegacyDataIfApplicable
} from './utils/userStorage';
import { AlertCircle } from 'lucide-react';

// Lazy-load secondary tabs to minimize initial bundle size and speed up page load
const StudyHistoryTab = lazy(() => import('./components/history/StudyHistoryTab'));
const LessonsTab = lazy(() => import('./components/lessons/LessonsTab'));
const AlphabetTab = lazy(() => import('./components/alphabet/AlphabetTab'));
const SpeakingCoachTab = lazy(() => import('./components/speaking/SpeakingCoachTab'));

function TabLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-outline">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-medium">Đang tải dữ liệu...</span>
    </div>
  );
}

export default function App() {
  const [mainTab, setMainTab] = useState('studio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('polyglot_sidebar_collapsed') === 'true');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('polyglot_sidebar_collapsed', String(next)); } catch (e) {}
      return next;
    });
  };

  const handleNavigate = (tabId, mode) => {
    setMainTab(tabId);
    if (mode) setStudyMode(mode);
  };

  const {
    currentUser, setCurrentUser, isUserModalOpen, setIsUserModalOpen,
    userSettings, setUserSettings, savedWords, setSavedWords,
    completedSentenceIds, setCompletedSentenceIds, studyHistory, setStudyHistory,
    hardLetters, setHardLetters, alphabetReviewProgress, setAlphabetReviewProgress,
    updateStudyHistory, handleToggleBlur, handleToggleGenderColors,
    handleToggleStrictGerman, handleToggleLiveCheck, handleToggleSoundEffects,
    handleToggleFocusMode, handleToggleHardLetter, handleSaveWord, handleRemoveWord
  } = useUserSession();

  const {
    isGamificationOpen, setIsGamificationOpen, activeReward, setActiveReward,
    gamificationData, setGamificationData, reloadGamification,
    handleCompleteSentenceReward, handleCompleteDailyReview,
    handleCompleteDaily5Checkoff, handleSaveWordReward,
    handleCompleteSpeakingCoachPractice
  } = useGamificationSession(currentUser);

  const {
    currentVideo, activeSegmentIndex, studyMode, setStudyMode,
    currentLanguage, setCurrentLanguage, playbackSpeed, setPlaybackSpeed,
    isLooping, setIsLooping, isLoading, errorMessage, setErrorMessage,
    resetTrigger, playerRef, activeSegment, handleSelectEpisode,
    handleLoadVideo, handleApplyCustomLesson, handleResetLesson,
    handleNextSegment, handlePrevSegment, handleSelectSegment,
    handleReplaySegment, handleReplaySlow
  } = useVideoSession(userSettings);

  const [selectedWord, setSelectedWord] = useState(null);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCustomTranscriptOpen, setIsCustomTranscriptOpen] = useState(false);

  // Sync completed sentences per video & user
  useEffect(() => {
    if (currentUser?.username && currentVideo?.videoId) {
      saveUserCompletedSentences(currentUser.username, currentVideo.videoId, completedSentenceIds);
    }
  }, [completedSentenceIds, currentVideo?.videoId, currentUser?.username]);

  const syncProgressOnLoad = (videoData, resetProgress) => {
    if (resetProgress) {
      setCompletedSentenceIds(new Set());
      if (currentUser?.username) {
        deleteUserCompletedSentences(currentUser.username, videoData.videoId);
      }
      updateStudyHistory(videoData, 0);
    } else {
      const userCompleted = currentUser?.username
        ? getUserCompletedSentences(currentUser.username, videoData.videoId)
        : new Set();
      setCompletedSentenceIds(userCompleted);
      updateStudyHistory(videoData, userCompleted.size);
    }
  };

  const handleResetLessonProgress = (video) => {
    setCompletedSentenceIds(new Set());
    if (currentUser?.username) {
      deleteUserCompletedSentences(currentUser.username, video.videoId);
    }
    updateStudyHistory(video, 0);
  };

  // Auto-resume last studied video on initial mount if available
  useEffect(() => {
    if (!currentVideo && studyHistory && studyHistory.length > 0) {
      handleLoadVideo(studyHistory[0].videoId, studyHistory[0].language, false, syncProgressOnLoad);
    }
  }, []);

  const handleSelectUser = (user) => {
    if (!user || !user.username) return;
    persistCurrentUser(user);
    setCurrentUser(user);
    migrateLegacyDataIfApplicable(user.username);

    const loadedSettings = getUserSettings(user.username);
    setUserSettings(loadedSettings);
    setCurrentLanguage(loadedSettings.selectedLang || 'de');
    setStudyMode(loadedSettings.activeMode || 'dictation');

    setSavedWords(getUserSavedVocab(user.username));
    const userHistory = getUserStudyHistory(user.username);
    setStudyHistory(userHistory);

    if (currentVideo?.videoId) {
      const userCompleted = getUserCompletedSentences(user.username, currentVideo.videoId);
      setCompletedSentenceIds(userCompleted);
      updateStudyHistory(currentVideo, userCompleted.size, user.username);
    } else {
      setCompletedSentenceIds(new Set());
    }

    reloadGamification(user.username);
    setHardLetters(getUserHardLetters(user.username));
    setAlphabetReviewProgress(getUserAlphabetReviewProgress(user.username));
    setIsUserModalOpen(false);
    setActiveReward({
      icon: user.avatar || '🦊',
      title: `Xin chào, ${user.username}!`,
      message: `Đã khôi phục cài đặt riêng và tiến độ học của bạn.`,
      xpGained: 0
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

  const handleCompleteSentence = (sentenceId, score, mode = studyMode) => {
    setCompletedSentenceIds((prev) => {
      const next = new Set([...prev, sentenceId]);
      if (currentVideo) {
        updateStudyHistory(currentVideo, next.size);
      }
      return next;
    });
    handleCompleteSentenceReward(score, mode);
  };

  const handleResetLessonFromHistory = (lesson) => {
    if (currentVideo?.videoId === lesson.videoId) {
      handleResetLesson(true, handleResetLessonProgress);
    } else {
      if (currentUser?.username) {
        deleteUserCompletedSentences(currentUser.username, lesson.videoId);
      }
      setStudyHistory((prev) =>
        prev.map((h) => (h.videoId === lesson.videoId ? { ...h, completedCount: 0 } : h))
      );
      handleLoadVideo(lesson.videoId, lesson.language, true, syncProgressOnLoad);
    }
    setMainTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#dfe2f0] font-sans flex flex-col relative selection:bg-primary selection:text-on-primary overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(128,131,255,0.12),rgba(255,255,255,0))]"></div>
      <div className="pointer-events-none fixed -top-32 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[140px]"></div>

      {/* Persistent Left Sidebar Navigation */}
      <AppSidebar
        activeTab={mainTab}
        studyMode={studyMode}
        onChangeTab={handleNavigate}
        savedVocabCount={savedWords.length}
        historyCount={studyHistory.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenVocab={() => setIsVocabOpen(true)}
        onOpenGamification={() => setIsGamificationOpen(true)}
        onOpenUserProfile={() => setIsUserModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Area (offset by Sidebar width on desktop) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onLoadVideo={(urlOrId, lang) => { handleLoadVideo(urlOrId, lang, false, syncProgressOnLoad); setMainTab('studio'); }}
          isLoading={isLoading}
          currentLanguage={currentLanguage}
          onChangeLanguage={(lang) => {
            setCurrentLanguage(lang);
            if (currentUser?.username) saveUserSettings(currentUser.username, { selectedLang: lang });
            if (currentVideo) handleLoadVideo(currentVideo.videoId, lang, false, syncProgressOnLoad);
          }}
          onOpenVocab={() => setIsVocabOpen(true)}
          savedVocabCount={savedWords.length}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          gamificationData={gamificationData}
          onOpenGamification={() => setIsGamificationOpen(true)}
          currentUser={currentUser}
          onOpenUserProfile={() => setIsUserModalOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-error-container/30 border border-error/50 flex flex-wrap items-center justify-between gap-3 text-error text-xs animate-shake">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AlertCircle className="w-4 h-4 text-error shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomTranscriptOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-bright text-[11px] font-semibold border border-outline-variant/40 transition-all cursor-pointer"
              >
                Nhập phụ đề thủ công
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-outline hover:text-on-surface cursor-pointer px-1"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        <Suspense fallback={<TabLoadingFallback />}>
          {mainTab === 'history' && (
            <StudyHistoryTab
              history={studyHistory}
              onSelectLesson={(lesson) => {
                handleLoadVideo(lesson.videoId, lesson.language, false, syncProgressOnLoad);
                setMainTab('studio');
              }}
              onSelectEpisode={(ep, reset) => {
                handleSelectEpisode(ep, reset, syncProgressOnLoad);
                setMainTab('studio');
              }}
              onResetLesson={handleResetLessonFromHistory}
              onRemoveLesson={(id) => setStudyHistory((prev) => prev.filter((h) => h.videoId !== id))}
              onClearHistory={() => setStudyHistory([])}
              onBackToStudio={() => setMainTab('studio')}
              hasActiveVideo={Boolean(currentVideo)}
            />
          )}

          {(mainTab === 'lessons' || mainTab === 'playlist') && (
            <LessonsTab
              onSelectEpisode={(ep, reset) => {
                handleSelectEpisode(ep, reset, syncProgressOnLoad);
                setMainTab('studio');
              }}
              onSelectLesson={(lesson) => {
                handleLoadVideo(lesson.videoId, lesson.language, false, syncProgressOnLoad);
                setMainTab('studio');
              }}
              completedVideoIds={studyHistory.filter((h) => h.completedCount >= (h.sentenceCount || 1)).map((h) => h.videoId)}
              currentVideoId={currentVideo?.videoId}
              onBackToStudio={() => setMainTab('studio')}
              onOpenAlphabet={() => setMainTab('alphabet')}
            />
          )}

          {mainTab === 'alphabet' && (
            <AlphabetTab
              hardLetters={hardLetters}
              onToggleHardLetter={handleToggleHardLetter}
              alphabetReviewProgress={alphabetReviewProgress}
              onCompleteDailyReview={(data) => handleCompleteDailyReview(data, setAlphabetReviewProgress)}
              onCompleteDaily5Checkoff={handleCompleteDaily5Checkoff}
              currentUser={currentUser}
            />
          )}

          {mainTab === 'speaking_coach' && (
            <SpeakingCoachTab
              currentVideo={currentVideo}
              currentUser={currentUser}
              onBackToStudio={() => setMainTab('studio')}
              onRecordSpeakingReward={handleCompleteSpeakingCoachPractice}
            />
          )}
        </Suspense>

        {mainTab === 'studio' && (
          <StudioWorkspace
            currentVideo={currentVideo}
            currentLanguage={currentLanguage}
            activeSegmentIndex={activeSegmentIndex}
            completedSentenceIds={completedSentenceIds}
            studyMode={studyMode}
            onChangeMode={handleChangeMode}
            onResetLesson={() => handleResetLesson(false, handleResetLessonProgress)}
            onSelectEpisode={(ep, reset) => handleSelectEpisode(ep, reset, syncProgressOnLoad)}
            onOpenPlaylistView={() => setMainTab('playlist')}
            playerRef={playerRef}
            activeSegment={activeSegment}
            isLooping={isLooping}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            handleNextSegment={handleNextSegment}
            handlePrevSegment={handlePrevSegment}
            handleReplaySegment={handleReplaySegment}
            handleReplaySlow={handleReplaySlow}
            setIsLooping={setIsLooping}
            resetTrigger={resetTrigger}
            userSettings={userSettings}
            handleToggleStrictGerman={handleToggleStrictGerman}
            handleToggleLiveCheck={handleToggleLiveCheck}
            handleCompleteSentence={handleCompleteSentence}
            isLoading={isLoading}
            studyHistory={studyHistory}
            onOpenLessons={() => setMainTab('lessons')}
            handleLoadVideo={(id, lang) => handleLoadVideo(id, lang, false, syncProgressOnLoad)}
            onOpenHistory={() => setMainTab('history')}
            handleSelectSegment={handleSelectSegment}
            setSelectedWord={setSelectedWord}
            handleToggleBlur={handleToggleBlur}
            handleToggleGenderColors={handleToggleGenderColors}
            isFocusMode={Boolean(userSettings?.isFocusMode)}
            onToggleFocusMode={() => handleToggleFocusMode(!userSettings?.isFocusMode)}
          />
        )}
      </main>
      </div>

      <AppModals
        currentUser={currentUser}
        isUserModalOpen={isUserModalOpen}
        onCloseUserModal={() => setIsUserModalOpen(false)}
        onSelectUser={handleSelectUser}
        selectedWord={selectedWord}
        onCloseWordPopover={() => setSelectedWord(null)}
        onSaveWord={(args) => handleSaveWord(args, handleSaveWordReward)}
        savedWords={savedWords}
        currentLanguage={currentLanguage}
        isVocabOpen={isVocabOpen}
        onCloseVocab={() => setIsVocabOpen(false)}
        onRemoveWord={handleRemoveWord}
        isShortcutsOpen={isShortcutsOpen}
        onCloseShortcuts={() => setIsShortcutsOpen(false)}
        isCustomTranscriptOpen={isCustomTranscriptOpen}
        onCloseCustomTranscript={() => setIsCustomTranscriptOpen(false)}
        onApplyCustomLesson={(data) => handleApplyCustomLesson(data, syncProgressOnLoad)}
        isGamificationOpen={isGamificationOpen}
        onCloseGamification={() => setIsGamificationOpen(false)}
        gamificationData={gamificationData}
        onUpdateGamificationData={(updated) => setGamificationData(updated)}
        activeReward={activeReward}
        onDismissReward={() => setActiveReward(null)}
      />
    </div>
  );
}
