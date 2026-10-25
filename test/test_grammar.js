import assert from 'assert';
import { getGermanNounInfo, getGenderStyles } from '../client/src/utils/germanGrammar.js';
import { analyzeGermanSentence, analyzeEnglishSentence, analyzeSentenceGrammar } from '../client/src/utils/sentenceAnalyzer.js';

console.log('🧪 Starting Tests for German Gender Detection & Sentence Grammar Analyzer...\n');

// 1. Test German Noun Gender Engine
console.log('Test 1: German Noun Gender Detection (Dictionary & Compound & Suffixes)');

// 1.1 Direct Dictionary
const tisch = getGermanNounInfo('Tisch');
assert(tisch, 'Failed to detect Tisch');
assert.strictEqual(tisch.gender, 'der', 'Tisch should be der');
assert.strictEqual(tisch.article, 'der');
console.log('  ✅ der Tisch detected correctly');

const frau = getGermanNounInfo('Frau');
assert(frau, 'Failed to detect Frau');
assert.strictEqual(frau.gender, 'die', 'Frau should be die');
console.log('  ✅ die Frau detected correctly');

const kind = getGermanNounInfo('Kind');
assert(kind, 'Failed to detect Kind');
assert.strictEqual(kind.gender, 'das', 'Kind should be das');
console.log('  ✅ das Kind detected correctly');

// 1.2 Compound Nouns (Komposita)
const hbf = getGermanNounInfo('Hauptbahnhof');
assert(hbf, 'Failed to detect Hauptbahnhof');
assert.strictEqual(hbf.gender, 'der', 'Hauptbahnhof should inherit der from Bahnhof');
console.log('  ✅ Compound noun Hauptbahnhof correctly resolved to der Bahnhof');

const krankenhaus = getGermanNounInfo('Krankenhaus');
assert(krankenhaus, 'Failed to detect Krankenhaus');
assert.strictEqual(krankenhaus.gender, 'das', 'Krankenhaus should inherit das from Haus');
console.log('  ✅ Compound noun Krankenhaus correctly resolved to das Haus');

// 1.3 Suffix Rules
const wohnung = getGermanNounInfo('Wohnung');
assert(wohnung, 'Failed to detect Wohnung');
assert.strictEqual(wohnung.gender, 'die', '-ung should be die');
console.log('  ✅ Suffix rule -ung: die Wohnung');

const maedchen = getGermanNounInfo('Mädchen');
assert(maedchen, 'Failed to detect Mädchen');
assert.strictEqual(maedchen.gender, 'das', '-chen should be das');
console.log('  ✅ Suffix rule -chen: das Mädchen');

const tourismus = getGermanNounInfo('Tourismus');
assert(tourismus, 'Failed to detect Tourismus');
assert.strictEqual(tourismus.gender, 'der', '-ismus should be der');
console.log('  ✅ Suffix rule -ismus: der Tourismus');

// 1.4 Contextual article
const kaffeeCtx = getGermanNounInfo('Kaffee', 'den');
assert(kaffeeCtx, 'Failed contextual noun');
assert.strictEqual(kaffeeCtx.gender, 'der');
console.log('  ✅ Contextual detection with "den Kaffee"');

// 2. Test Sentence Grammar Analyzer
console.log('\nTest 2: Sentence Grammar Analyzer (Syntactic Breakdown & Satzbau)');

// 2.1 Standard V2 sentence: "Ich bin Nico."
const s1 = analyzeGermanSentence('Ich bin Nico.');
assert(s1, 'Failed to analyze s1');
assert.strictEqual(s1.detectedSubject?.text, 'Ich');
assert.strictEqual(s1.detectedMainVerb?.text, 'bin');
assert.strictEqual(s1.detectedMainVerb?.details?.tense, 'Präsens');
assert.strictEqual(s1.satzbauExplanation?.type, 'V2_NORMAL');
console.log('  ✅ "Ich bin Nico.": Subject (Ich), Verb V2 (bin Präsens) verified');

// 2.2 Separable Verb (Trennbare Verben): "Nico ruft Lisa an."
const s2 = analyzeGermanSentence('Nico ruft Lisa an.');
assert(s2, 'Failed to analyze s2');
assert.strictEqual(s2.detectedMainVerb?.text, 'ruft');
assert.strictEqual(s2.detectedSeparablePrefix?.text, 'an');
assert(s2.trennbarNote, 'Expected trennbarNote to be generated');
assert.strictEqual(s2.trennbarNote.infinitive, 'anrufen');
console.log('  ✅ "Nico ruft Lisa an.": Separable verb detection correctly identified "anrufen"!');

// 2.3 W-Frage: "Wie heißt du?"
const s3 = analyzeGermanSentence('Wie heißt du?');
assert(s3, 'Failed to analyze s3');
assert.strictEqual(s3.satzbauExplanation?.type, 'W_FRAGE');
assert.strictEqual(s3.detectedSubject?.text, 'du');
console.log('  ✅ "Wie heißt du?": W-Frage structure detected');

// 2.4 Inversion: "Heute trinke ich Kaffee."
const s4 = analyzeGermanSentence('Heute trinke ich Kaffee.');
assert(s4, 'Failed to analyze s4');
assert.strictEqual(s4.satzbauExplanation?.type, 'INVERSION');
assert(s4.nounsInSentence.some(n => n.word === 'Kaffee' && n.gender === 'der'));
console.log('  ✅ "Heute trinke ich Kaffee.": Inversion rule after adverb "Heute" detected');

// 2.5 English sentence analyzer
const s5 = analyzeSentenceGrammar('I can speak German.', 'en');
assert(s5, 'Failed English analysis');
assert.strictEqual(s5.language, 'en');
console.log('  ✅ English fallback analysis verified');

console.log('\n🎉 ALL GERMAN GRAMMAR & SENTENCE ANALYZER TESTS PASSED!\n');
