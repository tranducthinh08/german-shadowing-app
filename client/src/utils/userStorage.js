/**
 * User Profile & User-Scoped Storage Manager
 * 
 * Manages multi-user profiles, user-scoped storage namespaces,
 * and user preferences/toggles so that each user has isolated:
 * - Toggles: blur script, noun gender color coding, target language, mode
 * - Progress: completed sentences per video, study history
 * - Sổ tay từ vựng: saved vocabulary
 * - Gamification: streak, daily goal, XP, badges
 */

export const USER_AVATARS = ['🦊', '🦉', '🦁', '🐼', '🐯', '🐬', '🚀', '⭐', '👑', '🎯', '🐱', '🐶'];

export const DEFAULT_USER_SETTINGS = {
  isBlurScript: true,
  showGenderColors: true,
  selectedLang: 'de',
  activeMode: 'dictation',
  dailySentenceGoal: 10,
  autoShowGrammar: true,
  strictNounCapitalization: true
};

const USERS_LIST_KEY = 'polyglot_users_list';
const CURRENT_USER_KEY = 'polyglot_current_user';

/**
 * Normalize username for safe storage keys
 */
export function normalizeUsername(username) {
  if (!username) return 'guest';
  return username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Get the list of all registered users
 * @returns {Array<{ username: string, avatar: string, lastActiveAt: string, level: number, xp: number }>}
 */
export function getUsersList() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USERS_LIST_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save users list
 */
function saveUsersList(list) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

/**
 * Get active user from localStorage
 * @returns {{ username: string, avatar: string } | null}
 */
export function getCurrentUser() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Set active user
 */
export function setCurrentUser(user) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        // Update user in users list
        const list = getUsersList();
        const norm = normalizeUsername(user.username);
        const existingIdx = list.findIndex(u => normalizeUsername(u.username) === norm);
        const item = {
          username: user.username,
          avatar: user.avatar || '🦊',
          lastActiveAt: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...item };
        } else {
          list.push(item);
        }
        saveUsersList(list);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  } catch (e) {}
}

/**
 * Generate a user-scoped storage key
 */
export function getUserStorageKey(username, baseKey) {
  const norm = normalizeUsername(username);
  return `polyglot_user_${norm}_${baseKey}`;
}

/**
 * Load user settings/toggles
 */
export function getUserSettings(username) {
  if (!username) return { ...DEFAULT_USER_SETTINGS };
  const key = getUserStorageKey(username, 'settings');
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_USER_SETTINGS };
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_USER_SETTINGS };
    return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

/**
 * Save user settings/toggles
 */
export function saveUserSettings(username, settings) {
  if (!username) return;
  const key = getUserStorageKey(username, 'settings');
  try {
    if (typeof localStorage !== 'undefined') {
      const current = getUserSettings(username);
      const merged = { ...current, ...settings };
      localStorage.setItem(key, JSON.stringify(merged));
    }
  } catch (e) {}
}

/**
 * Get user saved vocabulary notebook
 */
export function getUserSavedVocab(username) {
  if (!username) return [];
  const key = getUserStorageKey(username, 'saved_vocab');
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save user saved vocabulary
 */
export function saveUserSavedVocab(username, vocab) {
  if (!username) return;
  const key = getUserStorageKey(username, 'saved_vocab');
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(vocab));
    }
  } catch (e) {}
}

/**
 * Get user study history
 */
export function getUserStudyHistory(username) {
  if (!username) return [];
  const key = getUserStorageKey(username, 'study_history');
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save user study history
 */
export function saveUserStudyHistory(username, history) {
  if (!username) return;
  const key = getUserStorageKey(username, 'study_history');
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(history));
    }
  } catch (e) {}
}

/**
 * Get user completed sentence IDs for a video
 */
export function getUserCompletedSentences(username, videoId) {
  if (!username || !videoId) return new Set();
  const key = getUserStorageKey(username, `completed_${videoId}`);
  try {
    if (typeof localStorage === 'undefined') return new Set();
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

/**
 * Save user completed sentence IDs for a video
 */
export function saveUserCompletedSentences(username, videoId, completedIds) {
  if (!username || !videoId) return;
  const key = getUserStorageKey(username, `completed_${videoId}`);
  try {
    if (typeof localStorage !== 'undefined') {
      const arr = Array.from(completedIds || []);
      localStorage.setItem(key, JSON.stringify(arr));
    }
  } catch (e) {}
}

/**
 * Reset/Delete user completed sentence IDs for a video
 */
export function deleteUserCompletedSentences(username, videoId) {
  if (!username || !videoId) return;
  const key = getUserStorageKey(username, `completed_${videoId}`);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {}
}

/**
 * Migrate legacy data from un-prefixed localStorage keys
 * into a new user's profile if their user storage is currently empty.
 */
export function migrateLegacyDataIfApplicable(username) {
  if (!username || typeof localStorage === 'undefined') return;
  const norm = normalizeUsername(username);

  // Check if user already has study history
  const userHistoryKey = getUserStorageKey(norm, 'study_history');
  const existingUserHistory = localStorage.getItem(userHistoryKey);

  if (!existingUserHistory) {
    // Check for legacy study history
    const legacyHistory = localStorage.getItem('polyglot_study_history');
    if (legacyHistory) {
      localStorage.setItem(userHistoryKey, legacyHistory);
    }

    // Check for legacy saved vocab
    const legacyVocab = localStorage.getItem('polyglot_saved_vocab');
    if (legacyVocab) {
      localStorage.setItem(getUserStorageKey(norm, 'saved_vocab'), legacyVocab);
    }

    // Check for legacy gamification
    const legacyGamification = localStorage.getItem('polyglot_gamification');
    if (legacyGamification) {
      localStorage.setItem(getUserStorageKey(norm, 'gamification'), legacyGamification);
    }
  }
}
