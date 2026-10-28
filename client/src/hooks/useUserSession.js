import { useState, useEffect, useCallback } from 'react';
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
  getUserHardLetters,
  saveUserHardLetters,
  getUserAlphabetReviewProgress,
  saveUserAlphabetReviewProgress,
  migrateLegacyDataIfApplicable
} from '../utils/userStorage';

export function useUserSession() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isUserModalOpen, setIsUserModalOpen] = useState(() => !getCurrentUser());
  const [userSettings, setUserSettings] = useState(() => {
    const user = getCurrentUser();
    return getUserSettings(user?.username);
  });

  const [savedWords, setSavedWords] = useState(() => getUserSavedVocab(currentUser?.username));
  const [completedSentenceIds, setCompletedSentenceIds] = useState(() => new Set());
  const [studyHistory, setStudyHistory] = useState(() => getUserStudyHistory(currentUser?.username));
  const [hardLetters, setHardLetters] = useState(() => getUserHardLetters(currentUser?.username));
  const [alphabetReviewProgress, setAlphabetReviewProgress] = useState(
    () => getUserAlphabetReviewProgress(currentUser?.username)
  );

  // Auto-sync storage states
  useEffect(() => {
    if (currentUser?.username) {
      saveUserSavedVocab(currentUser.username, savedWords);
    }
  }, [savedWords, currentUser?.username]);

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

  const updateStudyHistory = useCallback((videoData, completedCount, username = currentUser?.username) => {
    if (!videoData) return;
    setStudyHistory((prev) => {
      const existing = prev.find((h) => h.videoId === videoData.videoId);
      const filtered = prev.filter((h) => h.videoId !== videoData.videoId);
      const totalSentences = videoData.sentences?.length || existing?.totalSentences || 0;
      const count = typeof completedCount === 'number' ? completedCount : completedSentenceIds.size;
      const prevPracticeCount = typeof existing?.practiceCount === 'number' && existing.practiceCount > 0
        ? existing.practiceCount
        : (existing && (existing.completedCount || 0) >= (existing.totalSentences || 1) ? 1 : 0);
      const practiceCount = prevPracticeCount > 0
        ? prevPracticeCount
        : (totalSentences > 0 && count >= totalSentences ? 1 : 0);

      const updatedItem = {
        videoId: videoData.videoId,
        title: videoData.title || existing?.title,
        author: videoData.author || existing?.author,
        thumbnail: videoData.thumbnail || existing?.thumbnail,
        language: videoData.language || existing?.language,
        totalSentences,
        completedCount: count,
        practiceCount,
        lastStudiedAt: new Date().toISOString()
      };
      const nextHistory = [updatedItem, ...filtered];
      if (username) {
        saveUserStudyHistory(username, nextHistory);
      }
      return nextHistory;
    });
  }, [currentUser?.username, completedSentenceIds.size]);

  const recordLessonCompletion = useCallback((videoData, username = currentUser?.username) => {
    if (!videoData) return;
    setStudyHistory((prev) => {
      const existing = prev.find((h) => h.videoId === videoData.videoId);
      const filtered = prev.filter((h) => h.videoId !== videoData.videoId);
      const total = videoData.sentences?.length || existing?.totalSentences || 0;
      const prevCount = existing?.practiceCount || (existing && (existing.completedCount || 0) >= (existing.totalSentences || 1) ? 1 : 0);
      const newPracticeCount = prevCount + 1;

      const updatedItem = {
        ...(existing || {}),
        videoId: videoData.videoId,
        title: videoData.title || existing?.title,
        author: videoData.author || existing?.author,
        thumbnail: videoData.thumbnail || existing?.thumbnail,
        language: videoData.language || existing?.language,
        totalSentences: total,
        completedCount: total,
        practiceCount: newPracticeCount,
        lastStudiedAt: new Date().toISOString()
      };
      const nextHistory = [updatedItem, ...filtered];
      if (username) {
        saveUserStudyHistory(username, nextHistory);
      }
      return nextHistory;
    });
  }, [currentUser?.username]);

  const handleToggleBlur = useCallback((newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, isBlurScript: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { isBlurScript: newVal });
      }
      return next;
    });
  }, [currentUser?.username]);

  const handleToggleGenderColors = useCallback((newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, showGenderColors: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { showGenderColors: newVal });
      }
      return next;
    });
  }, [currentUser?.username]);

  const handleToggleStrictGerman = useCallback((newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, strictNounCapitalization: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { strictNounCapitalization: newVal });
      }
      return next;
    });
  }, [currentUser?.username]);

  const handleToggleLiveCheck = useCallback((newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, isLiveCheck: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { isLiveCheck: newVal });
      }
      return next;
    });
  }, [currentUser?.username]);

  const handleToggleSoundEffects = useCallback((newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, soundEffectsEnabled: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { soundEffectsEnabled: newVal });
      }
      return next;
    });
  }, [currentUser?.username]);

  const handleToggleFocusMode = useCallback((newVal) => {
    setUserSettings((prev) => {
      const next = { ...prev, isFocusMode: newVal };
      if (currentUser?.username) {
        saveUserSettings(currentUser.username, { isFocusMode: newVal });
      }
      return next;
    });
  }, [currentUser?.username]);

  const handleToggleHardLetter = useCallback((letterId) => {
    setHardLetters((prev) =>
      prev.includes(letterId) ? prev.filter((id) => id !== letterId) : [...prev, letterId]
    );
  }, []);

  const handleSaveWord = useCallback(({ word, language, context, nounInfo }, onReward) => {
    const exists = savedWords.some((w) => w.word.toLowerCase() === word.toLowerCase());
    let nextWords = [];
    if (exists) {
      nextWords = savedWords.filter((w) => w.word.toLowerCase() !== word.toLowerCase());
    } else {
      nextWords = [
        { word, language, context, nounInfo, savedAt: new Date().toISOString() },
        ...savedWords
      ];
      if (onReward) {
        onReward(nextWords.length);
      }
    }
    setSavedWords(nextWords);
  }, [savedWords]);

  const handleRemoveWord = useCallback((word) => {
    setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== word.toLowerCase()));
  }, []);

  return {
    currentUser,
    setCurrentUser,
    isUserModalOpen,
    setIsUserModalOpen,
    userSettings,
    setUserSettings,
    savedWords,
    setSavedWords,
    completedSentenceIds,
    setCompletedSentenceIds,
    studyHistory,
    setStudyHistory,
    hardLetters,
    setHardLetters,
    alphabetReviewProgress,
    setAlphabetReviewProgress,
    updateStudyHistory,
    recordLessonCompletion,
    handleToggleBlur,
    handleToggleGenderColors,
    handleToggleStrictGerman,
    handleToggleLiveCheck,
    handleToggleSoundEffects,
    handleToggleFocusMode,
    handleToggleHardLetter,
    handleSaveWord,
    handleRemoveWord
  };
}
