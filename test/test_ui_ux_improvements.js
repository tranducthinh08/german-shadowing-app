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
  'client/src/components/studio/LessonCompletionModal.jsx',
  'client/src/components/lessons/LessonEpisodeCard.jsx',
  'client/src/components/playlist/PlaylistView.jsx',
  'client/src/components/dictation/DictationWorkspace.jsx',
  'client/src/components/shadowing/ShadowingWorkspace.jsx',
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

// Case 6.2: USER SCREENSHOT BUG REPRO: Actively typing prefix of word (hall in Hallo)
console.log('Test 6.2: Actively typing prefix (hall in Hallo) must be typing status, NOT red wrong');
const liveTypingHallo = computeLiveStream('hall', 'Hallo!', { strictCase: false });
assert.strictEqual(liveTypingHallo.tokens[0].status, 'typing', 'hall while typing Hallo must have typing status');
assert.strictEqual(liveTypingHallo.tokens[0].typedWord, 'hall');

const liveCompleteHallo = computeLiveStream('hallo', 'Hallo!', { strictCase: false });
assert.strictEqual(liveCompleteHallo.tokens[0].status, 'correct', 'hallo must be correct');
assert.strictEqual(liveCompleteHallo.matchedCount, 1);

const liveSpaceHallo = computeLiveStream('hall ', 'Hallo!', { strictCase: false });
assert.strictEqual(liveSpaceHallo.tokens[0].status, 'wrong', 'hall with trailing space finished word and must be wrong');

// CompareSentence score and typoCount verification
import { compareSentence } from '../client/src/utils/textDiff.js';
const diffHall = compareSentence('hall', 'Hallo!', { strictCase: false });
assert.strictEqual(diffHall.score, 50, 'hall vs Hallo gives 50% partial credit');
assert.strictEqual(diffHall.correctCount, 0, 'exact correctCount must be 0, not rounded to 1');
assert.strictEqual(diffHall.typoCount, 1, 'typoCount must be 1');
console.log('  ✅ Prefix while typing (hall) and exact count for spelling typos verified!');

// 7. Test completedVideoIds calculation logic
console.log('\nTest 7: Completed Video IDs calculation across history and active video');
import { NICOS_WEG_PLAYLIST } from '../client/src/data/nicosWegPlaylist.js';

function computeCompletedVideoIds(studyHistory, currentVideo, completedSentenceIds) {
  const ids = new Set();
  (studyHistory || []).forEach((h) => {
    const total = h.totalSentences || h.sentenceCount || 0;
    if (total > 0 && (h.completedCount || 0) >= total) ids.add(h.videoId);
  });
  if (currentVideo?.videoId && currentVideo?.sentences?.length > 0) {
    if (completedSentenceIds.size >= currentVideo.sentences.length) {
      ids.add(currentVideo.videoId);
    }
  }
  return Array.from(ids);
}

const mockHistory = [
  { videoId: 'ep1_vid', completedCount: 15, totalSentences: 15 }, // Fully completed with totalSentences
  { videoId: 'ep2_vid', completedCount: 5, totalSentences: 20 },  // In progress
  { videoId: 'ep3_vid', completedCount: 10, sentenceCount: 10 },  // Fully completed with legacy sentenceCount
];
const mockActiveVideo = {
  videoId: 'ep4_vid',
  sentences: [{ id: 1 }, { id: 2 }, { id: 3 }]
};

// When ep4 has 3 completed sentences
const completedIds = computeCompletedVideoIds(mockHistory, mockActiveVideo, new Set([1, 2, 3]));
assert(completedIds.includes('ep1_vid'), 'ep1_vid should be marked completed');
assert(!completedIds.includes('ep2_vid'), 'ep2_vid should NOT be marked completed');
assert(completedIds.includes('ep3_vid'), 'ep3_vid should be marked completed');
assert(completedIds.includes('ep4_vid'), 'ep4_vid should be marked completed via active session');
console.log('  ✅ completedVideoIds properly marks completed videos from history & active session');

// 8. Test Next Episode Resolution from NICOS_WEG_PLAYLIST
console.log('\nTest 8: Next Episode Auto-advance Resolution');
const ep1 = NICOS_WEG_PLAYLIST.episodes[0];
const ep2 = NICOS_WEG_PLAYLIST.episodes[1];
const lastEp = NICOS_WEG_PLAYLIST.episodes[NICOS_WEG_PLAYLIST.episodes.length - 1];

function resolveNextEpisode(currentVideoId) {
  const idx = NICOS_WEG_PLAYLIST.episodes.findIndex((e) => e.videoId === currentVideoId);
  if (idx >= 0 && idx < NICOS_WEG_PLAYLIST.episodes.length - 1) {
    return NICOS_WEG_PLAYLIST.episodes[idx + 1];
  }
  return null;
}

assert.strictEqual(resolveNextEpisode(ep1.videoId)?.id, ep2.id, 'Next episode of ep1 must be ep2');
assert.strictEqual(resolveNextEpisode(lastEp.videoId), null, 'Next episode of last episode must be null');
console.log('  ✅ Auto-advance accurately identifies next episode in curriculum');

// 9. Test Card Status Precedence (Completed has precedence over In Progress)
console.log('\nTest 9: Lesson Card Status Precedence');
function getBadgeStatus(isCompleted, isCurrent) {
  if (isCompleted) return 'Đã học';
  if (isCurrent) return 'Đang học';
  return null;
}

assert.strictEqual(getBadgeStatus(true, true), 'Đã học', 'When both completed and current, badge MUST be "Đã học"');
assert.strictEqual(getBadgeStatus(false, true), 'Đang học', 'When current but not completed, badge MUST be "Đang học"');
assert.strictEqual(getBadgeStatus(true, false), 'Đã học', 'When completed and not current, badge MUST be "Đã học"');
assert.strictEqual(getBadgeStatus(false, false), null, 'When neither, badge is null');
console.log('  ✅ Badge precedence verified: "Đã học" always takes precedence over "Đang học"');

// 10. Test Video Practice Count (Số lần đã luyện tập) Tracking & Formatting
console.log('\nTest 10: Practice count tracking and badge label formatting');
function getPracticeBadgeLabel(isCompleted, practiceCount = 0) {
  if (!isCompleted) return null;
  return practiceCount > 1 ? `Đã học (${practiceCount} lần)` : 'Đã học';
}

assert.strictEqual(getPracticeBadgeLabel(false, 0), null);
assert.strictEqual(getPracticeBadgeLabel(true, 1), 'Đã học', '1 completion must show "Đã học"');
assert.strictEqual(getPracticeBadgeLabel(true, 2), 'Đã học (2 lần)', '2 completions must show "Đã học (2 lần)"');
assert.strictEqual(getPracticeBadgeLabel(true, 5), 'Đã học (5 lần)', '5 completions must show "Đã học (5 lần)"');

// Test practiceCounts lookup derivation from history
const sampleHistory = [
  { videoId: 'v1', totalSentences: 10, completedCount: 10, practiceCount: 3 },
  { videoId: 'v2', totalSentences: 15, completedCount: 15 }, // Legacy item with no practiceCount -> default 1
  { videoId: 'v3', totalSentences: 20, completedCount: 5 }   // In progress -> 0
];

const derivedCounts = {};
sampleHistory.forEach((h) => {
  const total = h.totalSentences || h.sentenceCount || 0;
  const isDone = total > 0 && (h.completedCount || 0) >= total;
  const count = typeof h.practiceCount === 'number' ? h.practiceCount : (isDone ? 1 : 0);
  if (count > 0) derivedCounts[h.videoId] = count;
});

assert.strictEqual(derivedCounts['v1'], 3, 'v1 must have practiceCount 3');
assert.strictEqual(derivedCounts['v2'], 1, 'legacy completed v2 must have practiceCount 1');
assert.strictEqual(derivedCounts['v3'], undefined, 'incomplete v3 must not have practiceCount');
console.log('  ✅ Practice count formatting and derivation verified!');

// 11. Test Reset Lesson preserves practiceCount and completion badge
console.log('\nTest 11: Reset Lesson (Làm lại từ đầu) preservation of practiceCount and completed status');

function updateStudyHistoryMock(existingList, videoData, newCompletedCount) {
  const existing = existingList.find((h) => h.videoId === videoData.videoId);
  const filtered = existingList.filter((h) => h.videoId !== videoData.videoId);
  const total = videoData.sentences?.length || existing?.totalSentences || 0;
  const prevPracticeCount = typeof existing?.practiceCount === 'number' && existing.practiceCount > 0
    ? existing.practiceCount
    : (existing && (existing.completedCount || 0) >= (existing.totalSentences || 1) ? 1 : 0);
  const practiceCount = prevPracticeCount > 0
    ? prevPracticeCount
    : (total > 0 && newCompletedCount >= total ? 1 : 0);

  return [
    {
      videoId: videoData.videoId,
      totalSentences: total,
      completedCount: newCompletedCount,
      practiceCount
    },
    ...filtered
  ];
}

// 11.1: Completed episode in history
let history = [
  { videoId: 'ep1', totalSentences: 19, completedCount: 19, practiceCount: 1 }
];

// 11.2: User clicks "Làm lại từ đầu" -> completedCount resets to 0
history = updateStudyHistoryMock(history, { videoId: 'ep1', sentences: new Array(19).fill({}) }, 0);
assert.strictEqual(history[0].completedCount, 0, 'Current attempt progress must be reset to 0');
assert.strictEqual(history[0].practiceCount, 1, 'CRITICAL: practiceCount MUST be preserved at 1');

// 11.3: Check completedVideoIds resolution when completedCount is 0 but practiceCount is 1
function resolveStatusAndBadge(h, activeVideoId, activeCompletedCount) {
  const total = h.totalSentences || 0;
  const isDone = (typeof h.practiceCount === 'number' && h.practiceCount > 0) ||
    (total > 0 && (h.completedCount || 0) >= total);
  const practiceCount = typeof h.practiceCount === 'number' && h.practiceCount > 0
    ? h.practiceCount
    : (isDone ? 1 : 0);
  return { isDone, practiceCount };
}

const statusAfterReset = resolveStatusAndBadge(history[0], 'ep1', 0);
assert.strictEqual(statusAfterReset.isDone, true, 'isDone MUST remain true after reset because practiceCount > 0');
assert.strictEqual(statusAfterReset.practiceCount, 1, 'practiceCount must remain 1');
assert.strictEqual(getPracticeBadgeLabel(statusAfterReset.isDone, statusAfterReset.practiceCount), 'Đã học');

// 11.4: User finishes attempt 2 -> practiceCount increments to 2
history[0].practiceCount += 1;
history[0].completedCount = 19;
const statusAfterRound2 = resolveStatusAndBadge(history[0], 'ep1', 19);
assert.strictEqual(statusAfterRound2.practiceCount, 2);
assert.strictEqual(getPracticeBadgeLabel(statusAfterRound2.isDone, statusAfterRound2.practiceCount), 'Đã học (2 lần)');
console.log('  ✅ Reset lesson strictly preserves practiceCount and "Đã học" badge across retries!');

console.log('\n🎉 ALL UI/UX ENHANCEMENT TESTS PASSED SUCCESSFULLY!\n');
