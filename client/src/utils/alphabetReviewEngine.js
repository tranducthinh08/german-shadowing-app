/**
 * Alphabet Daily Review & Practice Engine
 * 
 * Generates tailored daily drills (listen & pick letter, minimal pairs contrast,
 * sound in context, and voice challenge) prioritizing starred and tricky sounds.
 */

import { GERMAN_ALPHABET, MINIMAL_PAIRS, getDifficultLetters, getAlphabetItemById } from '../data/germanAlphabetData.js';
import { getLocalDateString } from './timeFormat.js';

import {
  generateDailyReviewSession,
  generateTargeted5Quiz
} from "./alphabetQuestionGenerators.js";

export {
  generateDailyReviewSession,
  generateTargeted5Quiz
};

export function calculateReviewProgressUpdate(currentProgress, correctCount, totalQuestions) {
  const today = getLocalDateString();
  const lastDate = currentProgress?.lastReviewDate;

  let newStreak = currentProgress?.reviewStreak || 0;

  if (!lastDate) {
    // First time ever
    newStreak = 1;
  } else if (lastDate === today) {
    // Already studied today, maintain streak
    newStreak = Math.max(1, currentProgress.reviewStreak || 1);
  } else {
    // Check if consecutive day
    const d1 = new Date(lastDate);
    const d2 = new Date(today);
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1; // streak reset
    }
  }

  return {
    lastReviewDate: today,
    reviewStreak: newStreak,
    totalSessions: (currentProgress?.totalSessions || 0) + 1,
    totalQuestionsAnswered: (currentProgress?.totalQuestionsAnswered || 0) + totalQuestions,
    totalCorrect: (currentProgress?.totalCorrect || 0) + correctCount
  };
}

/**
 * Generate a deterministic seed number from date string and optional custom offset
 * @param {string} str
 * @param {number} offset
 * @returns {number}
 */
export function hashDateString(str, offset = 0) {
  let hash = 0;
  const fullStr = `${str || getLocalDateString()}_daily5_${offset || 0}`;
  for (let i = 0; i < fullStr.length; i++) {
    hash = (hash << 5) - hash + fullStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get 5 balanced featured sounds for a specific day.
 * Deterministic for each calendar day: Consistent throughout the day, auto-refreshes daily.
 * Can be rotated on-demand with customOffset.
 * 
 * Distribution:
 * - 2 Standard letters (A-Z)
 * - 1 Umlaut / Eszett (Ä, Ö, Ü, ß)
 * - 2 Crucial Clusters / Diphthongs (ei, ie, eu, ch, sch, sp, st, tsch...)
 * - Incorporates user starred letters when available.
 * 
 * @param {string} dateStr - Date string 'YYYY-MM-DD'
 * @param {number} customOffset - Manual rotation offset (0, 1, 2...)
 * @param {string[]} userStarredIds - List of user-starred letter IDs
 * @returns {Array<object>} Array of 5 alphabet objects
 */
export function getDailyFeaturedSounds(dateStr = getLocalDateString(), customOffset = 0, userStarredIds = []) {
  const seed = hashDateString(dateStr, customOffset);

  const standards = GERMAN_ALPHABET.filter(item => item.category === 'standard');
  const umlaute = GERMAN_ALPHABET.filter(item => item.category === 'umlaut');
  const clusters = GERMAN_ALPHABET.filter(item => item.category === 'cluster');

  // Deterministic pick based on seed
  const pickFromList = (list, count, seedMod) => {
    if (!list || list.length === 0) return [];
    const result = [];
    const copy = [...list];
    for (let i = 0; i < count && copy.length > 0; i++) {
      const idx = (seed + seedMod + i * 7) % copy.length;
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  };

  const selectedStandards = pickFromList(standards, 2, 11);
  const selectedUmlaut = pickFromList(umlaute, 1, 23);
  const selectedClusters = pickFromList(clusters, 2, 37);

  const featured = [...selectedStandards, ...selectedUmlaut, ...selectedClusters];

  // If user has starred letters, prioritize replacing 1-2 sounds with user's starred sounds
  const safeStarredIds = Array.isArray(userStarredIds) ? userStarredIds : [];
  if (safeStarredIds.length > 0) {
    const starredItems = safeStarredIds
      .map(id => getAlphabetItemById(id))
      .filter(item => Boolean(item) && !featured.some(f => f.id === item.id));

    if (starredItems.length > 0) {
      // Swap out the first standard item with a starred item
      featured[0] = starredItems[seed % starredItems.length];
    }
  }

  return featured;
}

/**
 * Generate a targeted 5-question review drill for the 5 daily featured sounds
 * @param {Array<object>} featuredSounds - The 5 featured alphabet items
 * @returns {Array<object>} Exactly 5 questions
 */
