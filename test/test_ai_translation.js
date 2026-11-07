import assert from 'assert';
import { getActiveGeminiKey, translateSentenceWithGemini } from '../server/src/services/gemini.service.js';
import {
  DEFAULT_USER_SETTINGS,
  getUserSettings,
  saveUserSettings,
  getUserGeminiKey
} from '../client/src/utils/userStorage.js';

console.log('🧪 Starting Automated Tests for Gemini AI & Translation System...\n');

// Mock localStorage if in node environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

// -------------------------------------------------------------
// Test 1: Active Gemini API Key Resolution (Hybrid Priority)
// -------------------------------------------------------------
console.log('Test 1: Gemini API Key Resolution');

// 1.1 Custom user key takes precedence
const customKey = 'AIzaSyCustomKeyProvidedByLearner99';
const resolvedCustom = getActiveGeminiKey(customKey);
assert.strictEqual(resolvedCustom, customKey, 'Should return custom key if provided');
console.log('  ✅ Custom user key correctly takes priority');

// 1.2 Invalid or empty custom key falls back to environment or empty
const emptyKey = getActiveGeminiKey('');
assert.strictEqual(emptyKey, process.env.GEMINI_API_KEY || '', 'Should fallback to env or empty');
console.log('  ✅ Empty key falls back safely to server env');

// -------------------------------------------------------------
// Test 2: Fallback Translation with Free Service (No API Key Scenario)
// -------------------------------------------------------------
console.log('\nTest 2: Safe Fallback Translation (No Gemini Key or Network Failure)');

// 2.1 Empty text handling
const emptyResult = await translateSentenceWithGemini('', 'de');
assert.strictEqual(emptyResult.translation, '');
assert.strictEqual(emptyResult.provider, 'fallback');
console.log('  ✅ Empty input safely handled with zero crash');

// 2.2 Standard German sentence fallback translation via Google Translate
const testSentence = 'Guten Morgen, wie geht es dir?';
const fallbackRes = await translateSentenceWithGemini(testSentence, 'de', '');
assert(fallbackRes, 'Result must exist');
assert.strictEqual(fallbackRes.provider, 'fallback', 'Provider must be fallback when key is absent');
assert(typeof fallbackRes.translation === 'string', 'Translation must be a string');
assert(fallbackRes.translation.length > 0, 'Translation should return non-empty text from fallback');
console.log(`  ✅ Fallback translation succeeded: "${fallbackRes.translation}" (Provider: ${fallbackRes.provider})`);

// -------------------------------------------------------------
// Test 3: User Storage Isolation for Custom Gemini API Key
// -------------------------------------------------------------
console.log('\nTest 3: User Storage Isolation for Custom Gemini API Key');

assert('geminiApiKey' in DEFAULT_USER_SETTINGS, 'DEFAULT_USER_SETTINGS must include geminiApiKey');
assert.strictEqual(DEFAULT_USER_SETTINGS.geminiApiKey, '', 'Default geminiApiKey must be empty string');

const testUser1 = 'learner_alpha';
const testUser2 = 'learner_beta';
const testKey1 = 'AIzaSyAlphaPersonalApiKey12345';

saveUserSettings(testUser1, { geminiApiKey: testKey1 });
const retrievedKey1 = getUserGeminiKey(testUser1);
const retrievedKey2 = getUserGeminiKey(testUser2);

assert.strictEqual(retrievedKey1, testKey1, 'User 1 should retrieve their custom Gemini key');
assert.strictEqual(retrievedKey2, '', 'User 2 should have empty default key (isolated)');
console.log('  ✅ Custom Gemini API key strictly isolated per user profile');

// -------------------------------------------------------------
// Test 4: Response Schema Contract Integrity
// -------------------------------------------------------------
console.log('\nTest 4: Response Schema Contract Integrity');

assert(Array.isArray(fallbackRes.terms), 'Terms should always be an array');
assert(typeof fallbackRes.literal === 'string', 'Literal should always be a string');
assert(typeof fallbackRes.grammarTip === 'string', 'GrammarTip should always be a string');
console.log('  ✅ Schema integrity contract ({ translation, literal, terms, grammarTip, provider }) verified');

console.log('\n🎉 ALL GEMINI AI & TRANSLATION TESTS PASSED SUCCESSFULLY!\n');
