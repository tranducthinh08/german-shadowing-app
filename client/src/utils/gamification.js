/**
 * Gamification & Habit Building Engine
 * 
 * Handles:
 * 1. Streak Tracking (Calculates daily streaks, streaks freeze, activity calendar)
 * 2. Daily Learning Goals (Sentence targets: 5, 10, 15, 25 sentences/day)
 * 3. XP (Experience Points) & Level Progression (Level 1 to 10 with titles)
 * 4. Achievement Badges (Unlockable milestones)
 * 5. LocalStorage persistence & real-time event broadcasting
 */

import { getLocalDateString } from './timeFormat.js';

const DEFAULT_STORAGE_KEY = 'polyglot_gamification';

/**
 * Generate user-scoped storage key for gamification
 */
export function getGamificationStorageKey(userOrName) {
  const username = typeof userOrName === 'object' ? userOrName?.username : userOrName;
  if (username && typeof username === 'string' && username.trim()) {
    const norm = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `polyglot_user_${norm}_gamification`;
  }
  return DEFAULT_STORAGE_KEY;
}

// Level thresholds and titles
export const LEVELS = [
  { level: 1, minXp: 0, title: 'Khởi đầu mới', badge: '🌱' },
  { level: 2, minXp: 50, title: 'Tập sự ngoại ngữ', badge: '🌿' },
  { level: 3, minXp: 150, title: 'Đôi tai chăm chỉ', badge: '🎧' },
  { level: 4, minXp: 300, title: 'Người học kiên trì', badge: '🔥' },
  { level: 5, minXp: 500, title: 'Phát âm chuẩn xác', badge: '🎙️' },
  { level: 6, minXp: 800, title: 'Chiến binh ngữ pháp', badge: '⚔️' },
  { level: 7, minXp: 1200, title: 'Bậc thầy Dictation', badge: '✍️' },
  { level: 8, minXp: 1800, title: 'Chuyên gia Shadowing', badge: '🌟' },
  { level: 9, minXp: 2600, title: 'Cao thủ đa ngôn ngữ', badge: '👑' },
  { level: 10, minXp: 3800, title: 'Huyền thoại PolyGlot', badge: '🏆' }
];

// All possible achievement badges
export const ALL_BADGES = [
  {
    id: 'first_sentence',
    name: 'Bước chân đầu tiên',
    desc: 'Hoàn thành câu học đầu tiên của bạn',
    icon: '🚀',
    category: 'milestone'
  },
  {
    id: 'perfect_score',
    name: 'Đôi tai vàng',
    desc: 'Chép chính tả đạt điểm số tuyệt đối 100%',
    icon: '🎯',
    category: 'skill'
  },
  {
    id: 'shadowing_star',
    name: 'Chiến thần phát âm',
    desc: 'Shadowing đạt độ chính xác trên 85%',
    icon: '🎙️',
    category: 'skill'
  },
  {
    id: 'streak_3',
    name: 'Ngọn lửa kiên trì',
    desc: 'Học liên tục trong 3 ngày',
    icon: '🔥',
    category: 'streak'
  },
  {
    id: 'streak_7',
    name: 'Thói quen thép',
    desc: 'Duy trì chuỗi học tập 7 ngày liên tiếp',
    icon: '⚡',
    category: 'streak'
  },
  {
    id: 'daily_goal_1',
    name: 'Mục tiêu hoàn thành',
    desc: 'Đạt 100% mục tiêu số câu học trong ngày',
    icon: '⭐',
    category: 'habit'
  },
  {
    id: 'grammar_explorer',
    name: 'Nhà phân tích ngữ pháp',
    desc: 'Xem phân tích ngữ pháp và giống danh từ',
    icon: '🧩',
    category: 'knowledge'
  },
  {
    id: 'vocab_collector',
    name: 'Nhà sưu tầm từ vựng',
    desc: 'Lưu ít nhất 5 từ mới vào sổ tay',
    icon: '📚',
    category: 'vocab'
  },
  {
    id: 'alphabet_master',
    name: 'Bậc thầy Chữ cái',
    desc: 'Hoàn thành bài ôn tập bảng chữ cái tiếng Đức',
    icon: '🔤',
    category: 'skill'
  }
];

// Helper: Format today as YYYY-MM-DD in local time
function getTodayString() {
  return getLocalDateString();
}

// Helper: Get difference in days between two YYYY-MM-DD strings
function getDayDifference(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2 - d1);
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Get initial default gamification state
function getDefaultGamificationState() {
  const today = getTodayString();
  return {
    streak: {
      currentStreak: 1,
      bestStreak: 1,
      lastStudyDate: today,
      activityDates: [today]
    },
    dailyGoal: {
      targetSentences: 10,
      completedToday: 0,
      lastDate: today
    },
    xp: {
      totalXp: 20, // Welcome bonus
      level: 1,
      levelTitle: 'Khởi đầu mới'
    },
    unlockedBadges: ['first_sentence'],
    recentReward: null
  };
}

/**
 * Load gamification data from localStorage and handle daily reset of daily goal
 * @param {string} [username]
 */
export function getGamificationData(username) {
  const key = getGamificationStorageKey(username);
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) {
      const initial = getDefaultGamificationState();
      saveGamificationData(initial, username);
      return initial;
    }

    const data = JSON.parse(raw);
    const today = getTodayString();

    // Check if daily goal needs reset for today
    if (data.dailyGoal.lastDate !== today) {
      data.dailyGoal.completedToday = 0;
      data.dailyGoal.lastDate = today;
    }

    // Check streak decay if missed > 1 day
    const dayDiff = getDayDifference(data.streak.lastStudyDate, today);
    if (dayDiff > 1) {
      data.streak.currentStreak = 0; // Streak broken
    }

    return data;
  } catch (e) {
    return getDefaultGamificationState();
  }
}

/**
 * Save gamification data to localStorage
 * @param {object} data
 * @param {string} [username]
 */
export function saveGamificationData(data, username) {
  const key = getGamificationStorageKey(username);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {}
}

/**
 * Calculate user level based on current total XP
 */
export function calculateLevel(totalXp) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (totalXp >= LEVELS[i].minXp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
    } else {
      break;
    }
  }

  const currentLevelMinXp = currentLevel.minXp;
  const nextLevelMinXp = nextLevel ? nextLevel.minXp : currentLevelMinXp + 1000;
  const progressInLevel = totalXp - currentLevelMinXp;
  const xpNeededForLevel = nextLevelMinXp - currentLevelMinXp;
  const progressPct = Math.min(100, Math.round((progressInLevel / xpNeededForLevel) * 100));

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    badge: currentLevel.badge,
    currentLevelMinXp,
    nextLevelMinXp,
    progressPct,
    xpToNextLevel: Math.max(0, nextLevelMinXp - totalXp)
  };
}

/**
 * Record a learning action and calculate rewards (XP, Streak, Goal, Badges)
 * 
 * @param {'COMPLETE_DICTATION'|'COMPLETE_SHADOWING'|'PERFECT_DICTATION'|'EXPLORE_GRAMMAR'|'SAVE_VOCAB'} action 
 * @param {object} [payload] 
 * @param {string} [username]
 * @returns {object} { xpGained, leveledUp, newBadge, goalReached, updatedData }
 */
export function recordLearningAction(action, payload = {}, username) {
  const user = username || payload?.username;
  const data = getGamificationData(user);
  const today = getTodayString();

  let xpGained = 0;
  let newBadges = [];
  let goalReached = false;
  let leveledUp = false;

  // 1. Process XP according to action
  switch (action) {
    case 'COMPLETE_DICTATION':
      xpGained = 15;
      data.dailyGoal.completedToday += 1;
      break;
    case 'PERFECT_DICTATION':
      xpGained = 25; // 15 + 10 bonus
      data.dailyGoal.completedToday += 1;
      if (!data.unlockedBadges.includes('perfect_score')) {
        newBadges.push('perfect_score');
      }
      break;
    case 'COMPLETE_SHADOWING':
      xpGained = payload.score >= 85 ? 25 : 15;
      data.dailyGoal.completedToday += 1;
      if (payload.score >= 85 && !data.unlockedBadges.includes('shadowing_star')) {
        newBadges.push('shadowing_star');
      }
      break;
    case 'EXPLORE_GRAMMAR':
      xpGained = 5;
      if (!data.unlockedBadges.includes('grammar_explorer')) {
        newBadges.push('grammar_explorer');
      }
      break;
    case 'SAVE_VOCAB':
      xpGained = 5;
      if (payload.vocabCount >= 5 && !data.unlockedBadges.includes('vocab_collector')) {
        newBadges.push('vocab_collector');
      }
      break;
    case 'ALPHABET_REVIEW':
    case 'alphabet_review':
      xpGained = payload?.xp || 30;
      if (!data.unlockedBadges.includes('alphabet_master')) {
        newBadges.push('alphabet_master');
      }
      break;
    case 'DAILY_5_COMPLETED':
    case 'daily_5_completed':
      xpGained = payload?.xp || 25;
      if (!data.unlockedBadges.includes('alphabet_master')) {
        newBadges.push('alphabet_master');
      }
      break;
    default:
      xpGained = 10;
  }

  // 2. Update Streak
  const lastDate = data.streak.lastStudyDate;
  if (!data.streak.activityDates.includes(today)) {
    data.streak.activityDates.push(today);
  }

  if (lastDate !== today) {
    const diff = getDayDifference(lastDate, today);
    if (diff === 1) {
      // Consecutive day!
      data.streak.currentStreak += 1;
    } else if (diff > 1) {
      // Missed days, start fresh at 1
      data.streak.currentStreak = 1;
    }
    data.streak.lastStudyDate = today;

    // Update best streak
    if (data.streak.currentStreak > data.streak.bestStreak) {
      data.streak.bestStreak = data.streak.currentStreak;
    }
  }

  // Check streak badges
  if (data.streak.currentStreak >= 3 && !data.unlockedBadges.includes('streak_3')) {
    newBadges.push('streak_3');
  }
  if (data.streak.currentStreak >= 7 && !data.unlockedBadges.includes('streak_7')) {
    newBadges.push('streak_7');
  }

  // 3. Check Daily Goal
  if (data.dailyGoal.completedToday >= data.dailyGoal.targetSentences && !data.dailyGoal.achievedToday) {
    goalReached = true;
    data.dailyGoal.achievedToday = true;
    xpGained += 30; // Goal completion bonus!
    if (!data.unlockedBadges.includes('daily_goal_1')) {
      newBadges.push('daily_goal_1');
    }
  }

  // 4. Update XP & Check Level Up
  const oldLevelInfo = calculateLevel(data.xp.totalXp);
  data.xp.totalXp += xpGained;
  const newLevelInfo = calculateLevel(data.xp.totalXp);

  if (newLevelInfo.level > oldLevelInfo.level) {
    leveledUp = true;
    data.xp.level = newLevelInfo.level;
    data.xp.levelTitle = newLevelInfo.title;
  }

  // Add newly unlocked badges
  newBadges.forEach((b) => {
    if (!data.unlockedBadges.includes(b)) {
      data.unlockedBadges.push(b);
    }
  });

  saveGamificationData(data, user);

  return {
    xpGained,
    leveledUp,
    newLevel: newLevelInfo,
    newBadges,
    goalReached,
    updatedData: data
  };
}

/**
 * Set daily goal target (e.g. 5, 10, 15, 25 sentences)
 * @param {number|string} target
 * @param {string} [username]
 */
export function updateDailyGoalTarget(target, username) {
  const data = getGamificationData(username);
  data.dailyGoal.targetSentences = Number(target) || 10;
  saveGamificationData(data, username);
  return data;
}
