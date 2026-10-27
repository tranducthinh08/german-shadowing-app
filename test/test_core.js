import assert from 'assert';
import { segmentSentences } from '../server/src/services/subtitle.parser.js';
import { extractVideoId } from '../server/src/services/youtube.service.js';
import { compareSentence, computeLiveStream } from '../client/src/utils/textDiff.js';
import { extractProperNouns } from '../client/src/utils/properNouns.js';

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

// Case D: User Screenshot Scenario (Tolerance for 's, ’s, and space before punctuation)
console.log('\nTest 4: Contraction \'s / ’s Tolerance & Punctuation Spacing');
const userTarget = 'Hey, Lena! Na, wie geht’s?';

// 1. User typed straight quote 's and space before !
const resUserCase = compareSentence('hey, Lena ! Na, wie geht\'s', userTarget, { strictCase: false });
assert.strictEqual(resUserCase.score, 100, 'User sentence with straight quote and spaced ! should score 100%');
assert.strictEqual(resUserCase.isPerfect, true, 'User sentence should be perfect');
assert(!resUserCase.tokens.some(t => t.status === 'extra'), 'Spaced exclamation mark should not be an extra token');
assert(!resUserCase.tokens.some(t => t.status === 'typo'), 'geht\'s vs geht’s should not be a typo');
console.log('  ✅ User screenshot case ("hey, Lena ! Na, wie geht\'s") scored 100% perfect!');

// 2. Testing all contraction variants (gehts, geht, geht 's)
const resNoApos = compareSentence('Hey, Lena! Na, wie gehts', userTarget, { strictCase: false });
assert.strictEqual(resNoApos.score, 100, 'gehts should match geht\'s without penalty');

const resOmittedS = compareSentence('Hey, Lena! Na, wie geht', userTarget, { strictCase: false });
assert.strictEqual(resOmittedS.score, 100, 'geht should match geht\'s without penalty');

const resSeparatedS = compareSentence('Hey, Lena! Na, wie geht \'s', userTarget, { strictCase: false });
assert.strictEqual(resSeparatedS.score, 100, 'geht \'s should match geht\'s without penalty');
console.log('  ✅ All apostrophe s variants (geht\'s, geht’s, gehts, geht, geht \'s) verified!');

// 3. Proper Nouns Extraction
console.log('\nTest 5: Proper Nouns Extractor (Nicos Weg & Contextual Detection)');
const names1 = extractProperNouns('Hey, Lena! Na, wie geht’s?', 'de');
assert(names1.includes('Lena'), 'Expected Lena to be extracted from "Hey, Lena! Na, wie geht’s?"');

const names2 = extractProperNouns('Hallo, Sarah! Wie geht es dir?', 'de');
assert(names2.includes('Sarah'), 'Expected Sarah to be extracted');

const names3 = extractProperNouns('Das ist Yara und das ist Sebastian.', 'de');
assert(names3.includes('Yara'), 'Expected Yara to be extracted');
assert(names3.includes('Sebastian'), 'Expected Sebastian to be extracted');

const names4 = extractProperNouns('Das ist Nicos Tasche.', 'de');
assert(names4.includes('Nicos'), 'Expected genitive Nicos to be extracted');
console.log('  ✅ Proper nouns successfully detected across Nicos Weg character names!');

// 4. Live Word-by-Word Stream Validation
console.log('\nTest 6: Real-Time Word-by-Word Live Check (computeLiveStream)');
const liveTarget = 'Hey, Lena! Na, wie geht’s?';

// Case A: User typed first word correctly with trailing space
const live1 = computeLiveStream('Hey, ', liveTarget, { strictCase: false });
assert.strictEqual(live1.tokens[0].status, 'correct', 'Word 1 should be green/correct');
assert.strictEqual(live1.tokens[1].status, 'pending', 'Word 2 should be pending');
assert.strictEqual(live1.matchedCount, 1);

// Case B: User typing second word in progress (prefix matching)
const live2 = computeLiveStream('Hey, Le', liveTarget, { strictCase: false });
assert.strictEqual(live2.tokens[0].status, 'correct');
assert.strictEqual(live2.tokens[1].status, 'typing', 'Word 2 should be in typing status');

// Case C: User typed second word wrong (pure red status, no answer leakage)
const live3 = computeLiveStream('Hey, Tom ', liveTarget, { strictCase: false });
assert.strictEqual(live3.tokens[0].status, 'correct');
assert.strictEqual(live3.tokens[1].status, 'wrong', 'Word 2 should be red/wrong');
assert.strictEqual(live3.tokens[1].typedWord, 'Tom');

// Case D: Full sentence matching with contraction s tolerance
const live4 = computeLiveStream('hey, Lena ! Na, wie geht\'s', liveTarget, { strictCase: false });
assert.strictEqual(live4.isComplete, true, 'All words should be matched and sentence complete');
assert.strictEqual(live4.matchedCount, 5);
assert.strictEqual(live4.score, 100);
console.log('  ✅ Real-time live check (correct/typing/wrong/pending/complete) verified!');

console.log('\n🎉 ALL AUTOMATED UNIT TESTS PASSED SUCCESSFULLY!\n');
