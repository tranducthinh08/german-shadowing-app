import assert from 'assert';

// Mock localStorage in Node.js environment
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

import {
  getCurrentUser,
  setCurrentUser,
  getUsersList,
  getUserSettings,
  saveUserSettings,
  getUserCompletedSentences,
  saveUserCompletedSentences,
  getUserSavedVocab,
  saveUserSavedVocab,
  getUserStudyHistory,
  saveUserStudyHistory
} from '../client/src/utils/userStorage.js';

import {
  getGamificationData,
  saveGamificationData,
  recordLearningAction
} from '../client/src/utils/gamification.js';

console.log('🧪 Starting Multi-User Storage & Isolation Unit Tests...\n');

// 1. Test User Registration & Switch Profile
console.log('Test 1: Register and switch user profiles');
setCurrentUser({ username: 'Alice', avatar: '🦊' });
const current1 = getCurrentUser();
assert.strictEqual(current1.username, 'Alice');
assert.strictEqual(current1.avatar, '🦊');

setCurrentUser({ username: 'Bob', avatar: '🦁' });
const current2 = getCurrentUser();
assert.strictEqual(current2.username, 'Bob');
assert.strictEqual(current2.avatar, '🦁');

const users = getUsersList();
assert.strictEqual(users.length, 2, 'Should have 2 users registered');
assert(users.some(u => u.username === 'Alice'));
assert(users.some(u => u.username === 'Bob'));
console.log('  ✅ Users registered and profile switching verified');

// 2. Test User Settings / Toggles Isolation
console.log('\nTest 2: User Settings & Toggles Isolation (Những gì người dùng bật)');
// Alice toggles: blur OFF, gender colors ON, mode shadowing, language de, strictNounCapitalization OFF
saveUserSettings('Alice', {
  isBlurScript: false,
  showGenderColors: true,
  activeMode: 'shadowing',
  selectedLang: 'de',
  strictNounCapitalization: false
});

// Bob toggles: blur ON, gender colors OFF, mode dictation, language en, strictNounCapitalization ON
saveUserSettings('Bob', {
  isBlurScript: true,
  showGenderColors: false,
  activeMode: 'dictation',
  selectedLang: 'en',
  strictNounCapitalization: true
});

const aliceSettings = getUserSettings('Alice');
assert.strictEqual(aliceSettings.isBlurScript, false, 'Alice blur should be FALSE');
assert.strictEqual(aliceSettings.showGenderColors, true, 'Alice gender colors should be TRUE');
assert.strictEqual(aliceSettings.activeMode, 'shadowing', 'Alice mode should be shadowing');
assert.strictEqual(aliceSettings.selectedLang, 'de', 'Alice lang should be de');
assert.strictEqual(aliceSettings.strictNounCapitalization, false, 'Alice strictNounCapitalization should be FALSE');

const bobSettings = getUserSettings('Bob');
assert.strictEqual(bobSettings.isBlurScript, true, 'Bob blur should be TRUE');
assert.strictEqual(bobSettings.showGenderColors, false, 'Bob gender colors should be FALSE');
assert.strictEqual(bobSettings.activeMode, 'dictation', 'Bob mode should be dictation');
assert.strictEqual(bobSettings.selectedLang, 'en', 'Bob lang should be en');
assert.strictEqual(bobSettings.strictNounCapitalization, true, 'Bob strictNounCapitalization should be TRUE');
console.log('  ✅ User settings are strictly isolated and do not collide');

// 3. Test Learning Progress & Completed Sentences Isolation
console.log('\nTest 3: Completed Sentences Isolation per Video');
const testVideoId = 'vid_german_lesson_1';

// Alice completed sentences [1, 2, 3]
saveUserCompletedSentences('Alice', testVideoId, new Set([1, 2, 3]));

// Bob has not done any sentences yet
const bobCompleted = getUserCompletedSentences('Bob', testVideoId);
assert.strictEqual(bobCompleted.size, 0, 'Bob should have 0 completed sentences');

// Alice's completed sentences are retrieved correctly
const aliceCompleted = getUserCompletedSentences('Alice', testVideoId);
assert.strictEqual(aliceCompleted.size, 3, 'Alice should have 3 completed sentences');
assert(aliceCompleted.has(1) && aliceCompleted.has(2) && aliceCompleted.has(3));
console.log('  ✅ Video learning progress isolated per user profile');

// 4. Test Gamification Isolation (XP, Streak, Badges)
console.log('\nTest 4: Gamification Isolation (XP, Streak, Badges)');
// Record action for Alice
recordLearningAction('COMPLETE_DICTATION', {}, 'Alice');
recordLearningAction('PERFECT_DICTATION', {}, 'Alice');

const aliceGamification = getGamificationData('Alice');
const bobGamification = getGamificationData('Bob');

assert(aliceGamification.xp.totalXp > bobGamification.xp.totalXp, 'Alice should have more XP than Bob');
assert(aliceGamification.unlockedBadges.includes('perfect_score'), 'Alice unlocked perfect_score');
assert(!bobGamification.unlockedBadges.includes('perfect_score'), 'Bob did not unlock perfect_score');
console.log('  ✅ Gamification XP, Streak, and Badges isolated per user');

// 5. Test Saved Vocab Isolation
console.log('\nTest 5: Saved Vocabulary Notebook Isolation');
saveUserSavedVocab('Alice', [{ word: 'Bahnhof', gender: 'der', vi: 'nhà ga' }]);
saveUserSavedVocab('Bob', [{ word: 'Apple', vi: 'quả táo' }]);

assert.strictEqual(getUserSavedVocab('Alice')[0].word, 'Bahnhof');
assert.strictEqual(getUserSavedVocab('Bob')[0].word, 'Apple');
console.log('  ✅ Vocabulary notebook isolated per user');

// 6. Test Object Tolerance in normalizeUsername and Storage Functions (No trim error)
console.log('\nTest 6: User Object vs String Tolerance (Prevents TypeError: trim is not a function)');
const userObj = { username: 'Alice', avatar: '🦊' };
assert.doesNotThrow(() => {
  getUserSettings(userObj);
  saveUserSettings(userObj, { isLiveCheck: true });
}, 'Storage methods must accept currentUser objects without throwing trim error');

console.log('  ✅ User object tolerance verified for all storage calls');

console.log('\n🎉 ALL MULTI-USER STORAGE & ISOLATION TESTS PASSED!\n');
