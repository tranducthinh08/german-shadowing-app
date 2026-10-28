/**
 * PolyGlot Studio - LocalStorage Health & Optimization Engine
 * 
 * Provides:
 * 1. Storage Health Analytics (bytes used, breakdown by feature, % of 5MB quota)
 * 2. Safe Storage Cleanup (prune legacy keys and orphaned completed progress)
 * 3. 1-Click Backup Export & Restore (Zero data loss across devices)
 */

import {
  getUserStorageKey,
  getUserSettings,
  saveUserSettings,
  getUserSavedVocab,
  saveUserSavedVocab,
  getUserStudyHistory,
  saveUserStudyHistory,
  getUserHardLetters,
  saveUserHardLetters,
  getUserAlphabetReviewProgress,
  saveUserAlphabetReviewProgress,
  getUserDaily5Progress,
  saveUserDaily5Progress,
  normalizeUsername
} from './userStorage.js';
import {
  getGamificationData,
  saveGamificationData
} from './gamification.js';

const TOTAL_QUOTA_BYTES = 5 * 1024 * 1024; // Standard 5MB LocalStorage limit

/**
 * Format bytes into human-readable string (B, KB, MB)
 */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Calculate total and itemized storage health
 */
export function getStorageHealth(userOrName) {
  if (typeof localStorage === 'undefined') {
    return {
      totalBytes: 0,
      totalFormatted: '0 B',
      quotaPercent: 0,
      status: 'optimal',
      breakdown: { vocab: 0, history: 0, completed: 0, gamification: 0, alphabet: 0, settings: 0, other: 0 }
    };
  }

  const username = normalizeUsername(userOrName);
  const userPrefix = `polyglot_user_${username}_`;

  let totalBytes = 0;
  let userBytes = 0;
  const breakdown = {
    vocab: 0,
    history: 0,
    completed: 0,
    gamification: 0,
    alphabet: 0,
    settings: 0,
    other: 0
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key) || '';
      const itemSize = (key.length + val.length) * 2; // UTF-16 characters = 2 bytes

      totalBytes += itemSize;

      if (key.startsWith(userPrefix)) {
        userBytes += itemSize;
        const subKey = key.slice(userPrefix.length);

        if (subKey === 'saved_vocab') breakdown.vocab += itemSize;
        else if (subKey === 'study_history') breakdown.history += itemSize;
        else if (subKey.startsWith('completed_')) breakdown.completed += itemSize;
        else if (subKey === 'gamification') breakdown.gamification += itemSize;
        else if (subKey.includes('alphabet') || subKey.includes('daily5')) breakdown.alphabet += itemSize;
        else if (subKey === 'settings') breakdown.settings += itemSize;
        else breakdown.other += itemSize;
      } else {
        breakdown.other += itemSize;
      }
    }
  } catch (e) {
    // Ignore storage read errors
  }

  const quotaPercent = Math.min(100, Math.round((totalBytes / TOTAL_QUOTA_BYTES) * 100));

  let status = 'optimal'; // < 2MB
  if (totalBytes > 4 * 1024 * 1024) status = 'warning'; // > 4MB
  else if (totalBytes > 2 * 1024 * 1024) status = 'moderate'; // 2-4MB

  return {
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
    userBytes,
    userFormatted: formatBytes(userBytes),
    quotaPercent,
    status,
    breakdown: {
      vocab: { bytes: breakdown.vocab, formatted: formatBytes(breakdown.vocab) },
      history: { bytes: breakdown.history, formatted: formatBytes(breakdown.history) },
      completed: { bytes: breakdown.completed, formatted: formatBytes(breakdown.completed) },
      gamification: { bytes: breakdown.gamification, formatted: formatBytes(breakdown.gamification) },
      alphabet: { bytes: breakdown.alphabet, formatted: formatBytes(breakdown.alphabet) },
      settings: { bytes: breakdown.settings, formatted: formatBytes(breakdown.settings) },
      other: { bytes: breakdown.other, formatted: formatBytes(breakdown.other) }
    }
  };
}

/**
 * Safely clean up orphaned completed progress and legacy un-namespaced keys
 */
export function cleanupStorage(userOrName) {
  if (typeof localStorage === 'undefined') return { freedBytes: 0, cleanedKeys: 0 };

  const username = normalizeUsername(userOrName);
  const userPrefix = `polyglot_user_${username}_`;
  let freedBytes = 0;
  let cleanedKeys = 0;

  try {
    // 1. Clean legacy un-namespaced duplicate keys if user already has user-scoped data
    const legacyKeys = ['polyglot_study_history', 'polyglot_saved_vocab', 'polyglot_gamification'];
    for (const lk of legacyKeys) {
      const val = localStorage.getItem(lk);
      if (val) {
        freedBytes += (lk.length + val.length) * 2;
        localStorage.removeItem(lk);
        cleanedKeys++;
      }
    }

    // 2. Clean completed progress for videos deleted from study history
    const history = getUserStudyHistory(username);
    const validVideoIds = new Set(history.map(h => h.videoId));

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${userPrefix}completed_`)) {
        const videoId = key.slice(`${userPrefix}completed_`.length);
        if (videoId && !validVideoIds.has(videoId)) {
          keysToRemove.push(key);
        }
      }
    }

    for (const k of keysToRemove) {
      const val = localStorage.getItem(k) || '';
      freedBytes += (k.length + val.length) * 2;
      localStorage.removeItem(k);
      cleanedKeys++;
    }
  } catch (e) {}

  return { freedBytes, freedFormatted: formatBytes(freedBytes), cleanedKeys };
}

/**
 * Export full user learning data as a JSON string for portable backup
 */
export function exportUserBackup(userOrName) {
  const username = normalizeUsername(userOrName);

  // Extract completed sentence sets for all videos in history
  const history = getUserStudyHistory(username);
  const completedSentences = {};
  for (const h of history) {
    if (h.videoId) {
      const key = getUserStorageKey(username, `completed_${h.videoId}`);
      try {
        const raw = localStorage.getItem(key);
        if (raw) completedSentences[h.videoId] = JSON.parse(raw);
      } catch (e) {}
    }
  }

  const backupData = {
    schemaVersion: '1.0',
    appName: 'PolyGlot Studio',
    exportedAt: new Date().toISOString(),
    username,
    settings: getUserSettings(username),
    savedVocab: getUserSavedVocab(username),
    studyHistory: history,
    completedSentences,
    hardLetters: getUserHardLetters(username),
    alphabetReview: getUserAlphabetReviewProgress(username),
    daily5: getUserDaily5Progress(username),
    gamification: getGamificationData(username)
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Import and restore user learning data from a JSON backup string
 */
export function importUserBackup(targetUserOrName, jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('Dữ liệu sao lưu không hợp lệ.');
  }

  const data = JSON.parse(jsonString);
  if (!data || data.appName !== 'PolyGlot Studio') {
    throw new Error('Tệp không đúng định dạng sao lưu của PolyGlot Studio.');
  }

  const targetUsername = normalizeUsername(targetUserOrName || data.username);

  // Restore each segment safely
  if (data.settings) saveUserSettings(targetUsername, data.settings);
  if (Array.isArray(data.savedVocab)) saveUserSavedVocab(targetUsername, data.savedVocab);
  if (Array.isArray(data.studyHistory)) saveUserStudyHistory(targetUsername, data.studyHistory);
  if (data.hardLetters) saveUserHardLetters(targetUsername, data.hardLetters);
  if (data.alphabetReview) saveUserAlphabetReviewProgress(targetUsername, data.alphabetReview);
  if (data.daily5) saveUserDaily5Progress(targetUsername, data.daily5);
  if (data.gamification) saveGamificationData(data.gamification, targetUsername);

  // Restore completed sentences per video
  if (data.completedSentences && typeof data.completedSentences === 'object') {
    for (const [videoId, ids] of Object.entries(data.completedSentences)) {
      if (videoId && Array.isArray(ids)) {
        const key = getUserStorageKey(targetUsername, `completed_${videoId}`);
        try {
          localStorage.setItem(key, JSON.stringify(ids));
        } catch (e) {}
      }
    }
  }

  return {
    success: true,
    restoredUser: targetUsername,
    vocabCount: data.savedVocab?.length || 0,
    historyCount: data.studyHistory?.length || 0
  };
}
