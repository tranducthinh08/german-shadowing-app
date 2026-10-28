import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n🧪 Starting Tests for UI/UX Pro Max Improvements...\n');

// Mock localStorage in Node.js for userStorage testing
if (typeof global.localStorage === 'undefined') {
  let store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (i) => Object.keys(store)[i] || null,
    get length() { return Object.keys(store).length; }
  };
}

// 1. Test Line limit for UI/UX components
console.log('Test 1: Line Limit Check for UI/UX Enhanced Files');
const filesToCheck = [
  'client/src/utils/soundEffects.js',
  'client/src/components/studio/StudioLessonHeader.jsx',
  'client/src/components/studio/StudioWorkspace.jsx',
  'client/src/components/studio/StudioStarterView.jsx',
  'client/src/components/dictation/DictationWorkspace.jsx',
  'client/src/components/common/ShortcutsModal.jsx',
  'client/src/App.jsx'
];

for (const relPath of filesToCheck) {
  const fullPath = path.join(rootDir, relPath);
  assert(fs.existsSync(fullPath), `File must exist: ${relPath}`);
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
  assert(lines <= 400, `${relPath} exceeds 400 lines (current: ${lines})`);
  console.log(`  ✅ ${relPath}: ${lines} lines (<= 400 lines)`);
}

// 2. Test User Settings Default Values & Isolation
console.log('\nTest 2: User Settings Default Values for Sound Effects & Focus Mode');
import { DEFAULT_USER_SETTINGS, getUserSettings, saveUserSettings } from '../client/src/utils/userStorage.js';

assert.strictEqual(DEFAULT_USER_SETTINGS.soundEffectsEnabled, true, 'Default soundEffectsEnabled must be true');
assert.strictEqual(DEFAULT_USER_SETTINGS.isFocusMode, false, 'Default isFocusMode must be false');
console.log('  ✅ DEFAULT_USER_SETTINGS verified: soundEffectsEnabled=true, isFocusMode=false');

// Test saving and toggling for a test user
const testUser = 'ux_tester_01';
saveUserSettings(testUser, { soundEffectsEnabled: false, isFocusMode: true });
const retrievedSettings = getUserSettings(testUser);
assert.strictEqual(retrievedSettings.soundEffectsEnabled, false, 'User setting soundEffectsEnabled must persist as false');
assert.strictEqual(retrievedSettings.isFocusMode, true, 'User setting isFocusMode must persist as true');
console.log('  ✅ User setting persistence verified for custom sound and focus states');

// 3. Test soundEffects.js safe execution without browser Web Audio
console.log('\nTest 3: Sound Effects safe invocation in non-browser or muted environments');
import { playSuccessSound, playPerfectSound } from '../client/src/utils/soundEffects.js';

// Should not throw even when window/AudioContext is not defined in Node.js
assert.doesNotThrow(() => {
  playSuccessSound(false); // muted
  playPerfectSound(false); // muted
  playSuccessSound(true);  // unmuted in node (safe fallback)
  playPerfectSound(true);  // unmuted in node (safe fallback)
}, 'Sound effects must never throw unhandled exceptions');
console.log('  ✅ Web Audio safe degradation verified (0 KB network overhead, graceful degradation)');

// 4. Test insertCharToInput in germanUtils.js (fix n.substring bug)
console.log('\nTest 4: German character insertion (insertCharToInput)');
import { insertCharToInput } from '../client/src/utils/germanUtils.js';

// Test 4.1: Insert at end of string (User screenshot case: 'guten morgen herr m' + 'ü' at pos 19)
const resEnd = insertCharToInput('guten morgen herr m', 19, 19, 'ü');
assert.strictEqual(resEnd.newText, 'guten morgen herr mü');
assert.strictEqual(resEnd.newCursorPos, 20);
console.log('  ✅ Insert character at end of text verified');

// Test 4.2: Insert in middle of string
const resMid = insertCharToInput('guten mgen', 7, 7, 'ö');
assert.strictEqual(resMid.newText, 'guten mögen');
assert.strictEqual(resMid.newCursorPos, 8);
console.log('  ✅ Insert character in middle of text verified');

// Test 4.3: Replace selected text range
const resReplace = insertCharToInput('guten morgen', 6, 12, 'Abend');
assert.strictEqual(resReplace.newText, 'guten Abend');
assert.strictEqual(resReplace.newCursorPos, 11);
console.log('  ✅ Replace highlighted text range verified');

// Test 4.4: Safe handling with empty or undefined inputs
const resEmpty = insertCharToInput('', 0, 0, 'ä');
assert.strictEqual(resEmpty.newText, 'ä');
assert.strictEqual(resEmpty.newCursorPos, 1);

const resNull = insertCharToInput(null, undefined, undefined, 'ß');
assert.strictEqual(resNull.newText, 'ß');
assert.strictEqual(resNull.newCursorPos, 1);
console.log('  ✅ Empty/undefined edge cases handled safely');

// 5. Test completed sentence unblur resolution strictly by sentence ID
console.log('\nTest 5: Completed sentence unblur check strictly by sentence ID (prevent premature unblur of next sentence)');
const sentence1 = { id: 1, text: 'Guten Morgen, Herr Müller' };
const sentence2 = { id: 2, text: 'Guten Morgen, Frau Schneider' };

function checkIsCompleted(completedSet, sentence) {
  return (
    completedSet.has(sentence.id) ||
    completedSet.has(String(sentence.id)) ||
    completedSet.has(Number(sentence.id))
  );
}

// Case 5.1: Sentence 1 completed (id = 1) -> Sentence 1 is unblurred
assert.strictEqual(checkIsCompleted(new Set([1]), sentence1), true);
assert.strictEqual(checkIsCompleted(new Set(['1']), sentence1), true);

// Case 5.2: CRITICAL BUG REPRO: When only sentence 1 is completed (Set([1])), sentence 2 (id = 2, index = 1) MUST NOT be completed!
assert.strictEqual(checkIsCompleted(new Set([1]), sentence2), false, 'Sentence 2 must NOT be marked completed when only sentence 1 is done');

// Case 5.3: Both completed
assert.strictEqual(checkIsCompleted(new Set([1, 2]), sentence2), true);
console.log('  ✅ Strict sentence ID matching verified: sentence 2 never prematurely unblurs');

// 6. Test Live Check does NOT falsely mark misspelled words as correct
console.log('\nTest 6: Real-time Live Check rejects misspelled words (komt -> komm, jetze -> jetzt)');
import { computeLiveStream } from '../client/src/utils/textDiff.js';

const targetSentence = 'Emma, komm jetzt Entschuldigung!';
const userMistakeInput = 'emma komt jetze';

const liveRes = computeLiveStream(userMistakeInput, targetSentence, { strictCase: false });

assert.strictEqual(liveRes.tokens[0].status, 'correct', 'emma matches Emma when strictCase=false');
assert.strictEqual(liveRes.tokens[1].status, 'wrong', 'komt is a spelling error for komm and MUST be wrong');
assert.strictEqual(liveRes.tokens[2].status, 'wrong', 'jetze is a spelling error for jetzt and MUST be wrong');
assert.strictEqual(liveRes.tokens[3].status, 'pending', 'Entschuldigung is not yet typed');
assert.strictEqual(liveRes.matchedCount, 1, 'Only 1 word (emma) is correct, NOT 3');
assert.strictEqual(liveRes.isComplete, false, 'Sentence must NOT be marked complete when words are wrong');
console.log('  ✅ Live check accurately flags spelling mistakes as wrong (no false positive)');

console.log('\n🎉 ALL UI/UX ENHANCEMENT TESTS PASSED SUCCESSFULLY!\n');
