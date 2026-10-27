import React, { useState, useEffect, useRef } from 'react';
import Header from './components/common/Header';
import YouTubePlayer from './components/player/YouTubePlayer';
import DictationWorkspace from './components/dictation/DictationWorkspace';
import ShadowingWorkspace from './components/shadowing/ShadowingWorkspace';
import TranscriptList from './components/transcript/TranscriptList';
import WordPopover from './components/vocab/WordPopover';
import VocabNotebookModal from './components/vocab/VocabNotebookModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import CustomTranscriptModal from './components/common/CustomTranscriptModal';
import StudyHistoryTab from './components/history/StudyHistoryTab';
import LessonsTab from './components/lessons/LessonsTab';
import PlaylistView from './components/playlist/PlaylistView';
import EpisodeNavBar from './components/playlist/EpisodeNavBar';
import AlphabetTab from './components/alphabet/AlphabetTab';
import GamificationModal from './components/gamification/GamificationModal';
import RewardToast from './components/gamification/RewardToast';
import UserProfileModal from './components/user/UserProfileModal';
import { getGamificationData, recordLearningAction } from './utils/gamification';
import { calculateReviewProgressUpdate } from './utils/alphabetReviewEngine';
import { NICOS_WEG_PLAYLIST, NICOS_WEG_EPISODES_MAP } from './data/nicosWegPlaylist';
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
  getUserHardLetters,
  saveUserHardLetters,
  getUserAlphabetReviewProgress,
  saveUserAlphabetReviewProgress,
  migrateLegacyDataIfApplicable
} from './utils/userStorage';
import { loadVideoApi } from './services/api';
import { PenTool, Mic, Sparkles, AlertCircle, History, RotateCcw, BookOpen, GraduationCap } from 'lucide-react';

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

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
  const [isCustomTranscriptOpen, setIsCustomTranscriptOpen] = useState(false);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [activeReward, setActiveReward] = useState(null);

  // Gamification state (per user)
  const [gamificationData, setGamificationData] = useState(() => getGamificationData(currentUser?.username));

  // User-scoped storage states
  const [savedWords, setSavedWords] = useState(() => getUserSavedVocab(currentUser?.username));
  const [completedSentenceIds, setCompletedSentenceIds] = useState(() => new Set());
  const [studyHistory, setStudyHistory] = useState(() => getUserStudyHistory(currentUser?.username));
  const [hardLetters, setHardLetters] = useState(() => getUserHardLetters(currentUser?.username));
  const [alphabetReviewProgress, setAlphabetReviewProgress] = useState(() => getUserAlphabetReviewProgress(currentUser?.username));

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

  useEffect(() => {
    if (currentUser?.username) {
      saveUserHardLetters(currentUser.username, hardLetters);
    }
  }, [hardLetters, currentUser?.username]);

  useEffect(() => {
    if (currentUser?.username) {
      saveUserAlphabetReviewProgress(currentUser.username, alphabetReviewProgress);
    }
  }, [alphabetReviewProgress, currentUser?.username]);

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

    // 6. Load user's alphabet review & starred letters
    const userHardLetters = getUserHardLetters(user.username);
    setHardLetters(userHardLetters);
    const userAlphabetProgress = getUserAlphabetReviewProgress(user.username);
    setAlphabetReviewProgress(userAlphabetProgress);

    // 7. Close modal & show friendly toast
    setIsUserModalOpen(false);
    setActiveReward({
      icon: user.avatar || '🦊',
      title: `Xin chào, ${user.username}!`,
      message: `Đã khôi phục cài đặt riêng và tiến độ học của bạn.`,
      xpGained: 0
    });
  };

  // Alphabet handlers
  const handleToggleHardLetter = (letterId) => {
    setHardLetters((prev) => {
      if (prev.includes(letterId)) {
        return prev.filter((id) => id !== letterId);
      } else {
        return [...prev, letterId];
      }
    });
  };

  const handleCompleteDailyReview = ({ correctCount, totalQuestions, xpEarned = 30, isDaily5 = false }) => {
    setAlphabetReviewProgress((prev) => calculateReviewProgressUpdate(prev, correctCount, totalQuestions));

    if (currentUser?.username) {
      const actionType = isDaily5 ? 'DAILY_5_COMPLETED' : 'ALPHABET_REVIEW';
      const { updatedData, reward } = recordLearningAction(currentUser.username, actionType, {
        xp: xpEarned,
        correctCount,
        totalQuestions
      });
      setGamificationData(updatedData);
      if (reward) {
        setActiveReward(reward);
      } else {
        setActiveReward({
          icon: isDaily5 ? '🎯' : '🔤',
          title: isDaily5 ? 'Hoàn thành 5 Âm Tiêu Điểm!' : 'Hoàn thành Ôn tập Chữ cái!',
          message: `Chính xác ${correctCount}/${totalQuestions} câu. Bạn nhận được +${xpEarned} XP!`,
          xpGained: xpEarned
        });
      }
    }
  };

  const handleCompleteDaily5Checkoff = (xpEarned = 25) => {
    if (currentUser?.username) {
      const { updatedData, reward } = recordLearningAction(currentUser.username, 'DAILY_5_COMPLETED', {
        xp: xpEarned
      });
      setGamificationData(updatedData);
      if (reward) {
        setActiveReward(reward);
      } else {
        setActiveReward({
          icon: '🎯',
          title: 'Xuất sắc! Đã ôn xong 5 Âm Tiêu Điểm!',
          message: `Bạn vừa hoàn thành luyện tập 5 âm vị hôm nay và nhận được +${xpEarned} XP!`,
          xpGained: xpEarned
        });
      }
    }
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

  const handleToggleStrictGerman = (newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, strictNounCapitalization: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { strictNounCapitalization: newVal });
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

  // Load episode directly from pre-indexed Nicos Weg curriculum
  const handleSelectEpisode = (episode, resetProgress = false) => {
    if (!episode) return;
    const lessonData = {
      videoId: episode.videoId,
      title: episode.fullTitle || episode.title,
      author: episode.author || 'DW Deutsch lernen',
      language: 'de',
      thumbnail: episode.thumbnail,
      sentences: episode.sentences,
      isSample: true,
      playlistInfo: {
        playlistId: 'PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix',
        episodeNumber: episode.episodeNumber,
        category: episode.category
      }
    };
    setCurrentVideo(lessonData);
    setCurrentLanguage('de');
    setActiveSegmentIndex(0);
    setIsLooping(false);
    setResetTrigger((prev) => prev + 1);

    if (resetProgress) {
      setCompletedSentenceIds(new Set());
      if (currentUser?.username) {
        deleteUserCompletedSentences(currentUser.username, episode.videoId);
      }
      updateStudyHistory(lessonData, 0);
    } else {
      const userCompleted = currentUser?.username
        ? getUserCompletedSentences(currentUser.username, episode.videoId)
        : new Set();
      setCompletedSentenceIds(userCompleted);
      updateStudyHistory(lessonData, userCompleted.size);
    }

    setErrorMessage(null);
    setMainTab('studio');
  };

  // Load video handler
  const handleLoadVideo = async (urlOrId, lang = currentLanguage, resetProgress = false) => {
    // 1. Check if it's one of the 80 episodes in our pre-indexed Nicos Weg series (instant offline load)
    const rawId = extractVideoId(urlOrId);
    if (rawId && NICOS_WEG_EPISODES_MAP[rawId]) {
      handleSelectEpisode(NICOS_WEG_EPISODES_MAP[rawId], resetProgress);
      return;
    }

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

  // Load custom transcript lesson created manually
  const handleApplyCustomLesson = (lessonData) => {
    setCurrentVideo(lessonData);
    setCurrentLanguage(lessonData.language || currentLanguage);
    setActiveSegmentIndex(0);
    setIsLooping(false);
    setResetTrigger((prev) => prev + 1);
    setCompletedSentenceIds(new Set());
    updateStudyHistory(lessonData, 0);
    setErrorMessage(null);
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

        {/* TAB 1: DEDICATED STUDY HISTORY TAB */}
        {mainTab === 'history' && (
          <StudyHistoryTab
            history={studyHistory}
            onSelectLesson={(lesson) => {
              handleLoadVideo(lesson.videoId, lesson.language);
              setMainTab('studio');
            }}
            onSelectEpisode={handleSelectEpisode}
            onResetLesson={handleResetLessonFromHistory}
            onRemoveLesson={(id) => setStudyHistory((prev) => prev.filter((h) => h.videoId !== id))}
            onClearHistory={() => setStudyHistory([])}
            onBackToStudio={() => setMainTab('studio')}
            hasActiveVideo={Boolean(currentVideo)}
          />
        )}

        {/* TAB 2: DEDICATED LESSONS & CURRICULUM TAB (A1, A2, B1, EN) */}
        {(mainTab === 'lessons' || mainTab === 'playlist') && (
          <LessonsTab
            onSelectEpisode={handleSelectEpisode}
            onSelectLesson={(lesson) => {
              handleLoadVideo(lesson.videoId, lesson.language);
              setMainTab('studio');
            }}
            completedVideoIds={studyHistory.filter(h => h.completedCount >= (h.sentenceCount || 1)).map(h => h.videoId)}
            currentVideoId={currentVideo?.videoId}
            onBackToStudio={() => setMainTab('studio')}
            onOpenAlphabet={() => setMainTab('alphabet')}
          />
        )}

        {/* TAB 3: GERMAN ALPHABET & DAILY REVIEW */}
        {mainTab === 'alphabet' && (
          <AlphabetTab
            hardLetters={hardLetters}
            onToggleHardLetter={handleToggleHardLetter}
            alphabetReviewProgress={alphabetReviewProgress}
            onCompleteDailyReview={handleCompleteDailyReview}
            onCompleteDaily5Checkoff={handleCompleteDaily5Checkoff}
            currentUser={currentUser}
          />
        )}

        {/* TAB 3: STUDIO WORKSPACE */}
        {mainTab === 'studio' && (
          <>
            {/* Episode Navigation Bar if video belongs to Nicos Weg */}
            {currentVideo && NICOS_WEG_EPISODES_MAP[currentVideo.videoId] && (
              <EpisodeNavBar
                currentVideoId={currentVideo.videoId}
                onSelectEpisode={handleSelectEpisode}
                onOpenPlaylistView={() => setMainTab('playlist')}
              />
            )}

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
                        key={`dict-${currentVideo?.videoId || 'vid'}-${activeSegment?.id || activeSegmentIndex}-${resetTrigger}`}
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
                        strictGerman={userSettings.strictNounCapitalization !== undefined ? userSettings.strictNounCapitalization : true}
                        onToggleStrictGerman={handleToggleStrictGerman}
                      />
                    ) : (
                      <ShadowingWorkspace
                        key={`shad-${currentVideo?.videoId || 'vid'}-${activeSegment?.id || activeSegmentIndex}-${resetTrigger}`}
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
                  <div className="p-8 sm:p-10 text-center rounded-2xl bg-surface-container/70 border border-outline-variant/30 space-y-5 shadow-xl backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center mx-auto shadow-md">
                      <Sparkles className="w-6 h-6 text-on-primary-container" />
                    </div>
                    <div>
                      <h2 className="text-lg font-headline font-bold text-on-surface">
                        Bắt đầu bài học của bạn
                      </h2>
                      <p className="text-xs text-outline max-w-md mx-auto mt-1 leading-relaxed">
                        Dán link YouTube bất kỳ vào thanh tìm kiếm ở trên, hoặc bấm chọn một bài học chuẩn dưới đây để bắt đầu ngay:
                      </p>
                    </div>

                    {/* Featured Curriculum: Nicos Weg A1 (DW) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-secondary/15 via-surface-container-high to-primary/10 border border-secondary/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm max-w-xl mx-auto">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-on-secondary">
                            TRỌN BỘ 76 TẬP
                          </span>
                          <span className="text-xs font-bold text-secondary flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Giáo trình Nicos Weg A1 (DW)
                          </span>
                        </div>
                        <p className="text-[11px] text-outline leading-snug">
                          80 video bài học đã tích hợp sẵn 100% phụ đề chuẩn, chia câu tự động và học offline/online không bao giờ lỗi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMainTab('lessons')}
                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-secondary to-primary hover:opacity-95 text-on-primary font-bold text-xs shadow-md shadow-secondary/20 hover:scale-105 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Mở kho bài học (A1 • A2)</span>
                      </button>
                    </div>

                    {/* Quick Starter Lessons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-1">
                      <button
                        type="button"
                        onClick={() => handleLoadVideo('dC6ZGLzdaTs', 'de')}
                        disabled={isLoading}
                        className="p-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-bright border border-outline-variant/30 hover:border-secondary/40 text-left transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary mb-1">
                          <span>🇩🇪</span>
                          <span>Nicos Weg A1</span>
                        </div>
                        <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          Folge 1: Hallo!
                        </p>
                        <span className="text-[10px] text-outline mt-1 block">DW Deutsch • 19 câu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadVideo('jPvhLhCkhB8', 'de')}
                        disabled={isLoading}
                        className="p-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-bright border border-outline-variant/30 hover:border-secondary/40 text-left transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary mb-1">
                          <span>🇩🇪</span>
                          <span>Easy German</span>
                        </div>
                        <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          Berlin: What do you like?
                        </p>
                        <span className="text-[10px] text-outline mt-1 block">Giao tiếp • 7 câu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadVideo('gghSrnzS9kY', 'en')}
                        disabled={isLoading}
                        className="p-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-bright border border-outline-variant/30 hover:border-primary/40 text-left transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1">
                          <span>🇬🇧</span>
                          <span>English Daily</span>
                        </div>
                        <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          Ordering at a Café
                        </p>
                        <span className="text-[10px] text-outline mt-1 block">Hội thoại • 8 câu</span>
                      </button>
                    </div>

                    {studyHistory.length > 0 && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setMainTab('history')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container-high hover:bg-surface-bright text-secondary font-semibold text-xs rounded-full border border-outline-variant/30 transition-all cursor-pointer shadow-xs"
                        >
                          <History className="w-3.5 h-3.5 text-primary" />
                          <span>Xem lại lịch sử học tập ({studyHistory.length} bài)</span>
                        </button>
                      </div>
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

      {/* Custom Transcript Modal */}
      <CustomTranscriptModal
        isOpen={isCustomTranscriptOpen}
        onClose={() => setIsCustomTranscriptOpen(false)}
        onApplyCustomLesson={handleApplyCustomLesson}
        currentLanguage={currentLanguage}
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
