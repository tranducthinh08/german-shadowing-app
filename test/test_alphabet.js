import assert from 'assert';
import {
  GERMAN_ALPHABET,
  MINIMAL_PAIRS,
  getDifficultLetters,
  getAlphabetItemById
} from '../client/src/data/germanAlphabetData.js';
import {
  generateDailyReviewSession,
  calculateReviewProgressUpdate
} from '../client/src/utils/alphabetReviewEngine.js';
import {
  getUserHardLetters,
  saveUserHardLetters,
  getUserAlphabetReviewProgress,
  saveUserAlphabetReviewProgress
} from '../client/src/utils/userStorage.js';

// Polyfill localStorage in Node.js environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear()
  };
}

console.log('🧪 Starting Automated Tests for German Alphabet, Hard Letters & Daily Review...\n');

// -------------------------------------------------------------
// Test 1: Alphabet Master Dataset Integrity
// -------------------------------------------------------------
console.log('Test 1: German Alphabet & Phonetics Master Dataset Integrity');
assert.strictEqual(GERMAN_ALPHABET.length, 41, 'Expected 41 total alphabet & phonetic items (26 A-Z + 4 Umlaute + 11 clusters)');

// Standard A-Z letters check
const standardLetters = GERMAN_ALPHABET.filter(i => i.category === 'standard');
assert.strictEqual(standardLetters.length, 26, 'Expected 26 standard letters A-Z');

// Umlaute check
const umlaute = GERMAN_ALPHABET.filter(i => i.category === 'umlaut');
assert.strictEqual(umlaute.length, 4, 'Expected 4 special characters (Ä, Ö, Ü, ß)');
const umlautIds = umlaute.map(u => u.id);
assert(umlautIds.includes('ae'), 'Missing Ä');
assert(umlautIds.includes('oe'), 'Missing Ö');
assert(umlautIds.includes('ue'), 'Missing Ü');
assert(umlautIds.includes('sz'), 'Missing ß');

// Clusters check
const clusters = GERMAN_ALPHABET.filter(i => i.category === 'cluster');
assert.strictEqual(clusters.length, 11, 'Expected 11 diphthongs and consonant clusters');

// Verify all items have required fields
for (const item of GERMAN_ALPHABET) {
  assert(item.id, `Item missing id: ${JSON.stringify(item)}`);
  assert(item.letter, `Item missing letter: ${item.id}`);
  assert(item.name, `Item missing name: ${item.id}`);
  assert(item.ipa, `Item missing ipa: ${item.id}`);
  assert(item.viApprox, `Item missing viApprox: ${item.id}`);
  assert(item.mouthTip, `Item missing mouthTip: ${item.id}`);
  assert(Array.isArray(item.examples) && item.examples.length > 0, `Item missing examples: ${item.id}`);
  for (const ex of item.examples) {
    assert(ex.de, `Example missing German text in ${item.id}`);
    assert(ex.vi, `Example missing Vietnamese meaning in ${item.id}`);
    assert(ex.phonetic, `Example missing phonetic guidance in ${item.id}`);
  }
}
console.log('  ✅ 41 German alphabet items, Umlaute, and clusters fully validated');

// -------------------------------------------------------------
// Test 2: Curated Difficult Letters & Minimal Pairs
// -------------------------------------------------------------
console.log('\nTest 2: Difficult Letters & Contrast Minimal Pairs');
const difficultItems = getDifficultLetters();
assert(difficultItems.length >= 10, 'Expected at least 10 tricky letters flagged');

// V and W must be flagged as difficult
const vItem = getAlphabetItemById('v');
const wItem = getAlphabetItemById('w');
const zItem = getAlphabetItemById('z');
assert(vItem && vItem.isDifficult, 'Letter V should be marked difficult');
assert(wItem && wItem.isDifficult, 'Letter W should be marked difficult');
assert(zItem && zItem.isDifficult, 'Letter Z should be marked difficult');
assert(vItem.difficultyTag.includes('V đọc là F'), 'V letter must note pronunciation as F');
assert(wItem.difficultyTag.includes('W đọc là V'), 'W letter must note pronunciation as V');
assert(zItem.difficultyTag.includes('TS'), 'Z letter must note pronunciation as TS');

// Minimal pairs validation
assert(MINIMAL_PAIRS.length >= 4, 'Expected at least 4 curated minimal pairs');
const vwPair = MINIMAL_PAIRS.find(p => p.id === 'v_vs_w');
assert(vwPair, 'Expected V vs W minimal pair');
const eiPair = MINIMAL_PAIRS.find(p => p.id === 'ei_vs_ie');
assert(eiPair, 'Expected EI vs IE minimal pair');
console.log('  ✅ Curated difficult sounds (V, W, Z, Umlaute, EI vs IE) verified');

// -------------------------------------------------------------
// Test 3: Daily Review Session Generator Engine
// -------------------------------------------------------------
console.log('\nTest 3: Daily Review Session Generator Engine');
const session = generateDailyReviewSession(['v', 'oe', 'cluster_ei'], 8);
assert.strictEqual(session.length, 8, 'Generated session should have 8 questions');

// Verify question properties
for (const q of session) {
  assert(q.id, 'Question missing id');
  assert(q.type, 'Question missing type');
  assert(q.title, 'Question missing title');
  assert(q.instruction, 'Question missing instruction');
  assert(Array.isArray(q.options) && q.options.length > 0, 'Question missing options');
  const correctCount = q.options.filter(o => o.isCorrect).length;
  assert.strictEqual(correctCount, 1, `Question ${q.id} must have exactly 1 correct option`);
}
console.log('  ✅ Generated 8 diverse questions with verified single-correct-answer integrity');

// -------------------------------------------------------------
// Test 4: Streak & Progress Calculator
// -------------------------------------------------------------
console.log('\nTest 4: Review Progress & Streak Calculation');
const today = new Date().toISOString().split('T')[0];

// First time ever session
const p1 = calculateReviewProgressUpdate(null, 7, 8);
assert.strictEqual(p1.reviewStreak, 1, 'Initial streak should be 1');
assert.strictEqual(p1.totalSessions, 1);
assert.strictEqual(p1.totalCorrect, 7);
assert.strictEqual(p1.lastReviewDate, today);

// Same day additional session: streak remains 1, sessions increment
const p2 = calculateReviewProgressUpdate(p1, 8, 8);
assert.strictEqual(p2.reviewStreak, 1, 'Same day session keeps current streak');
assert.strictEqual(p2.totalSessions, 2);
assert.strictEqual(p2.totalCorrect, 15);

// Consecutive day session (yesterday to today): streak increments
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const yesterdayProgress = {
  lastReviewDate: yesterday,
  reviewStreak: 3,
  totalSessions: 3,
  totalQuestionsAnswered: 24,
  totalCorrect: 20
};
const p3 = calculateReviewProgressUpdate(yesterdayProgress, 8, 8);
assert.strictEqual(p3.reviewStreak, 4, 'Consecutive day increments streak from 3 to 4');
assert.strictEqual(p3.totalSessions, 4);
console.log('  ✅ Streak progression (initial, same-day, consecutive-day) verified');

// -------------------------------------------------------------
// Test 5: Multi-User Storage & Isolation for Alphabet Data
// -------------------------------------------------------------
console.log('\nTest 5: Multi-User Alphabet Storage Isolation');
const userA = 'alice_de';
const userB = 'bob_de';

// User A stars V and W
saveUserHardLetters(userA, ['v', 'w']);
// User B stars Z and OE
saveUserHardLetters(userB, ['z', 'oe', 'ue']);

const lettersA = getUserHardLetters(userA);
const lettersB = getUserHardLetters(userB);

assert.deepStrictEqual(lettersA, ['v', 'w'], 'User A should have exactly v and w starred');
assert.deepStrictEqual(lettersB, ['z', 'oe', 'ue'], 'User B should have exactly z, oe, ue starred');

// User A saves progress
saveUserAlphabetReviewProgress(userA, { lastReviewDate: today, reviewStreak: 5 });
const progressA = getUserAlphabetReviewProgress(userA);
const progressB = getUserAlphabetReviewProgress(userB);

assert.strictEqual(progressA.reviewStreak, 5);
assert.strictEqual(progressB.reviewStreak, 0, 'User B must not be affected by User A progress');
console.log('  ✅ Multi-user isolation for hard letters and review streaks verified');

console.log('\n🎉 ALL GERMAN ALPHABET & DAILY REVIEW TESTS PASSED SUCCESSFULLY!\n');
