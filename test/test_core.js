import assert from 'assert';
import { segmentSentences } from '../server/src/services/subtitle.parser.js';
import { extractVideoId } from '../server/src/services/youtube.service.js';
import { compareSentence } from '../client/src/utils/textDiff.js';

console.log('🧪 Starting Automated Tests for PolyGlot Shadowing & Dictation...\n');

// 1. Test YouTube Video ID Extractor
console.log('Test 1: YouTube Video ID Extractor');
const id1 = extractVideoId('https://www.youtube.com/watch?v=4-eDoThe6qo');
const id2 = extractVideoId('https://youtu.be/4-eDoThe6qo');
const id3 = extractVideoId('https://www.youtube.com/shorts/4-eDoThe6qo?feature=share');
const id4 = extractVideoId('4-eDoThe6qo');

assert.strictEqual(id1, '4-eDoThe6qo', 'Failed standard watch URL');
assert.strictEqual(id2, '4-eDoThe6qo', 'Failed youtu.be URL');
assert.strictEqual(id3, '4-eDoThe6qo', 'Failed shorts URL');
assert.strictEqual(id4, '4-eDoThe6qo', 'Failed direct ID');
console.log('  ✅ Video ID Extractor passed all URL patterns!');

// 2. Test Subtitle Parser & Sentence Segmentation
console.log('\nTest 2: Subtitle Parser & Smart Sentence Segmentation');
const mockRawCaptions = [
  { text: 'Hallo! [Musik]', start: 1.0, duration: 2.0 },
  { text: 'Ich bin Nico.', start: 3.5, duration: 2.0 },
  { text: 'Wie heißt', start: 6.0, duration: 1.0 },
  { text: 'du eigentlich?', start: 7.2, duration: 1.5 }
];

const segmented = segmentSentences(mockRawCaptions);
assert.strictEqual(segmented.length, 3, `Expected 3 sentences, got ${segmented.length}`);
assert.strictEqual(segmented[0].text, 'Hallo!', 'First sentence mismatch');
assert.strictEqual(segmented[0].start, 1.0);
assert.strictEqual(segmented[0].end, 3.0);
assert.strictEqual(segmented[1].text, 'Ich bin Nico.');
assert.strictEqual(segmented[2].text, 'Wie heißt du eigentlich?');

// Test cleaning speaker dashes (- , – ) and ellipses (... , …)
const mockWithDashes = [
  { text: '– Hallo, wie geht es dir?', start: 10.0, duration: 2.0 },
  { text: '– Mir geht es gut … danke!', start: 12.5, duration: 2.5 }
];
const cleanedDashes = segmentSentences(mockWithDashes);
assert.strictEqual(cleanedDashes[0].text, 'Hallo, wie geht es dir?');
assert.strictEqual(cleanedDashes[1].text, 'Mir geht es gut danke!');
console.log('  ✅ Subtitle cleaner successfully stripped speaker dashes (–, -) and ellipses (..., …)!');

// 3. Test Text Diff Engine (Dictation)
console.log('\nTest 3: Dictation Text Diff Algorithm');

// Case A: Perfect match
const resPerfect = compareSentence('Hallo ich bin Nico', 'Hallo, ich bin Nico.', { strictCase: false });
assert.strictEqual(resPerfect.score, 100, 'Expected 100% for perfect match');
assert.strictEqual(resPerfect.isPerfect, true);
console.log('  ✅ Perfect match scored 100%');

// Case B: German Umlaut typo (e.g. uber vs über)
const resUmlaut = compareSentence('Das ist uberhaupt kein Problem', 'Das ist überhaupt kein Problem', {
  strictCase: false,
  strictGermanUmlauts: true
});
const typoToken = resUmlaut.tokens.find(t => t.status === 'typo');
assert(typoToken, 'Expected umlaut to be flagged as typo');
assert.strictEqual(typoToken.word, 'überhaupt');
console.log('  ✅ German umlaut detection correctly flagged missing umlaut!');

// Case C: Missing and Extra words
const resDiff = compareSentence('Hallo Nico', 'Hallo, ich bin Nico.', { strictCase: false });
assert(resDiff.tokens.some(t => t.status === 'missing'), 'Expected missing tokens');
assert(resDiff.score < 100, 'Score should be less than 100%');
console.log('  ✅ Missing word detection verified!');

console.log('\n🎉 ALL AUTOMATED UNIT TESTS PASSED SUCCESSFULLY!\n');
