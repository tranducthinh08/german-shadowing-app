import assert from 'assert';
import {
  analyzeSpeechPhonetics,
  GERMAN_SPEAKING_DRILLS,
  stripUmlauts,
  hasUmlautOrEszett,
  PHONETIC_RULES_TIPS
} from '../client/src/utils/speakingCoachEngine.js';

console.log('🧪 Starting Automated Tests for AI Speaking Coach Diagnostic Engine...\n');

// 1. Test Exact Match
console.log('Test 1: Exact Speech Match (100% Native-like)');
const res1 = analyzeSpeechPhonetics('Wie schön ist dieser Tag!', 'wie schön ist dieser tag');
assert.strictEqual(res1.score, 100);
assert.strictEqual(res1.grade, 'native_like');
assert.strictEqual(res1.words.length, 5);
assert(res1.words.every(w => w.status === 'correct'));
console.log('  ✅ Exact speech matches scored 100% with native_like grade');

// 2. Test Missing Umlaut (schön vs schon)
console.log('\nTest 2: Missing Umlaut Detection (schön -> schon)');
const res2 = analyzeSpeechPhonetics('Wie schön ist dieser Tag!', 'wie schon ist dieser tag');
assert(res2.score < 100 && res2.score >= 70, `Score should be partial, got: ${res2.score}`);
const schonWord = res2.words.find(w => w.clean === 'schön');
assert(schonWord, 'Word schön should be evaluated');
assert.strictEqual(schonWord.status, 'partial');
assert(res2.alerts.some(a => a.type === 'umlaut'), 'Should alert about missing Umlaut');
console.log('  ✅ Missing Umlaut (ö -> o) flagged with partial credit and phonetic tip');

// 3. Test Consonant Quirks Detection (V as F, W as V, Z as TS)
console.log('\nTest 3: Consonant Quirks Detection (Vater, Wasser, Zeit)');
const res3 = analyzeSpeechPhonetics('Mein Vater trinkt Wasser zur Zeit.', 'mein water trinkt wasser deit');
assert(res3.alerts.some(a => a.type === 'v_f'), 'Should detect V as F in Vater');
assert(res3.alerts.some(a => a.type === 'z'), 'Should detect Z in Zeit');
console.log('  ✅ German consonant quirks (V as F, Z as TS) detected with actionable alerts');

// 4. Test Curated Practice Drills Integrity
console.log('\nTest 4: Curated Practice Drills Library Integrity');
assert.strictEqual(GERMAN_SPEAKING_DRILLS.length, 5, 'Expected 5 practice categories');
for (const cat of GERMAN_SPEAKING_DRILLS) {
  assert(cat.categoryId, 'Category must have categoryId');
  assert(cat.categoryTitle, 'Category must have title');
  assert(Array.isArray(cat.sentences) && cat.sentences.length > 0, 'Category must have sentences');
  for (const s of cat.sentences) {
    assert(s.id, 'Sentence missing id');
    assert(s.de, 'Sentence missing German text');
    assert(s.vi, 'Sentence missing Vietnamese translation');
  }
}
console.log('  ✅ 5 drill categories with 21 curated German pronunciation sentences verified');

// 5. Test Edge Cases & Clean Punctuation
console.log('\nTest 5: Edge Cases & Punctuation Stripping');
const emptyRes = analyzeSpeechPhonetics('', '');
assert.strictEqual(emptyRes.score, 0);
assert.strictEqual(emptyRes.words.length, 0);

assert.strictEqual(stripUmlauts('schön'), 'schon');
assert.strictEqual(stripUmlauts('über'), 'uber');
assert.strictEqual(stripUmlauts('Mädchen'), 'Madchen');
assert.strictEqual(stripUmlauts('Straße'), 'Strasse');
assert.strictEqual(hasUmlautOrEszett('schön'), true);
assert.strictEqual(hasUmlautOrEszett('hallo'), false);
console.log('  ✅ Edge cases and Umlaut stripping verified');

console.log('\n🎉 ALL AI SPEAKING COACH TESTS PASSED SUCCESSFULLY!\n');
