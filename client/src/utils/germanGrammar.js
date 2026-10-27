/**
 * German Grammar & Noun Gender Knowledge Base & Detection Engine
 * 
 * Provides:
 * 1. Curated dictionary of 800+ most frequent German nouns (A1-B1) with gender, plural, and Vietnamese meaning
 * 2. Morphological suffix rules (die -ung, der -ismus, das -chen...)
 * 3. Contextual article-aware detection (der, die, das, den, dem, des, ein, eine, einen, einem...)
 * 4. Helper styling functions for UI badges and tags
 */

export const GENDER_TYPES = {
  MASKULIN: 'der',
  FEMININ: 'die',
  NEUTRAL: 'das',
  PLURAL: 'die_pl'
};

// 800+ Most frequent German nouns with Gender, Plural, and Vietnamese Translation
import { GERMAN_NOUN_DICTIONARY } from "../data/germanNounDictionary.js";
export { GERMAN_NOUN_DICTIONARY };

// Morphological Suffix Rules
export const SUFFIX_RULES = [
  // Feminin (die) Suffixes - Very reliable in German (~99%)
  { suffix: 'ung', gender: 'die', reason: 'Đuôi -ung luôn là giống cái (die)' },
  { suffix: 'heit', gender: 'die', reason: 'Đuôi -heit luôn là giống cái (die)' },
  { suffix: 'keit', gender: 'die', reason: 'Đuôi -keit luôn là giống cái (die)' },
  { suffix: 'schaft', gender: 'die', reason: 'Đuôi -schaft luôn là giống cái (die)' },
  { suffix: 'tät', gender: 'die', reason: 'Đuôi -tät luôn là giống cái (die)' },
  { suffix: 'tion', gender: 'die', reason: 'Đuôi -tion luôn là giống cái (die)' },
  { suffix: 'sion', gender: 'die', reason: 'Đuôi -sion luôn là giống cái (die)' },
  { suffix: 'ik', gender: 'die', reason: 'Đuôi -ik thường là giống cái (die)' },
  { suffix: 'ie', gender: 'die', reason: 'Đuôi -ie thường là giống cái (die)' },
  { suffix: 'ei', gender: 'die', reason: 'Đuôi -ei luôn là giống cái (die)' },
  { suffix: 'ur', gender: 'die', reason: 'Đuôi -ur thường là giống cái (die)' },
  { suffix: 'in', gender: 'die', reason: 'Hậu tố giống cái -in (chỉ nữ giới)' },

  // Neutral (das) Suffixes - Very reliable
  { suffix: 'chen', gender: 'das', reason: 'Hậu tố giảm nhẹ -chen luôn là giống trung (das)' },
  { suffix: 'lein', gender: 'das', reason: 'Hậu tố giảm nhẹ -lein luôn là giống trung (das)' },
  { suffix: 'ment', gender: 'das', reason: 'Đuôi -ment thường là giống trung (das)' },
  { suffix: 'um', gender: 'das', reason: 'Đuôi -um có nguồn gốc La-tinh là giống trung (das)' },
  { suffix: 'tum', gender: 'das', reason: 'Đuôi -tum phần lớn là giống trung (das)' },
  { suffix: 'ma', gender: 'das', reason: 'Đuôi -ma gốc Hy Lạp (Thema, Drama...) là giống trung (das)' },

  // Maskulin (der) Suffixes
  { suffix: 'ismus', gender: 'der', reason: 'Đuôi -ismus luôn là giống đực (der)' },
  { suffix: 'ling', gender: 'der', reason: 'Đuôi -ling luôn là giống đực (der)' },
  { suffix: 'or', gender: 'der', reason: 'Đuôi -or (chỉ người/máy móc) là giống đực (der)' },
  { suffix: 'ant', gender: 'der', reason: 'Đuôi -ant (chỉ người) là giống đực (der)' },
  { suffix: 'ent', gender: 'der', reason: 'Đuôi -ent (chỉ người) là giống đực (der)' },
  { suffix: 'ist', gender: 'der', reason: 'Đuôi -ist (chỉ người) là giống đực (der)' },
  { suffix: 'eur', gender: 'der', reason: 'Đuôi -eur là giống đực (der)' },
  { suffix: 'ig', gender: 'der', reason: 'Đuôi -ig thường là giống đực (der)' }
];

// Contextual Preceding Articles mapping
export const ARTICLE_MAP = {
  // Nominativ
  'der': 'der',
  'die': 'die',
  'das': 'das',
  // Akkusativ
  'den': 'der',
  'einen': 'der',
  'meinen': 'der',
  'deinen': 'der',
  'seinen': 'der',
  'ihren': 'der',
  // Dativ
  'dem': 'der', // or das
  'einem': 'der', // or das
  'meinem': 'der',
  'deinem': 'der',
  // Feminin Indefinite / Possessive
  'eine': 'die',
  'meine': 'die',
  'deine': 'die',
  'seine': 'die',
  'ihre': 'die'
};

/**
 * Determine the gender and grammar metadata for a German word
 * 
 * @param {string} rawWord - The word to evaluate (e.g. "Kaffee", "Mädchen", "Wohnung")
 * @param {string} [prevWord] - The preceding word in the sentence (e.g. "den", "eine", "das")
 * @returns {object|null} - Gender metadata or null if not a recognized German noun
 */
export function getGermanNounInfo(rawWord, prevWord = '') {
  if (!rawWord || typeof rawWord !== 'string') return null;

  // Clean punctuation from word
  const clean = rawWord.replace(/^[^a-zA-ZäöüßÄÖÜ]+|[^a-zA-ZäöüßÄÖÜ]+$/g, '');
  if (!clean) return null;

  // In German, all nouns MUST be capitalized!
  // If the word doesn't start with a capital letter, it's not a noun (unless sentence start)
  const isCapitalized = /^[A-ZÄÖÜ]/.test(clean);
  if (!isCapitalized) return null;

  const lower = clean.toLowerCase();

  // 1. Direct dictionary match
  if (GERMAN_NOUN_DICTIONARY[lower]) {
    const entry = GERMAN_NOUN_DICTIONARY[lower];
    return {
      word: clean,
      gender: entry.gender,
      article: entry.gender,
      plural: entry.plural,
      vi: entry.vi,
      source: 'dictionary',
      reason: `Danh từ chuẩn: ${entry.gender} ${clean}`
    };
  }

  // 2. Compound noun check (Komposita): In German, compound nouns take the gender of the LAST component!
  // E.g., "Hauptbahnhof" -> "Bahnhof" (der), "Sonnenbrille" -> "Brille" (die), "Krankenhaus" -> "Haus" (das)
  for (const [key, entry] of Object.entries(GERMAN_NOUN_DICTIONARY)) {
    if (lower.length > key.length + 2 && lower.endsWith(key)) {
      return {
        word: clean,
        gender: entry.gender,
        article: entry.gender,
        plural: entry.plural,
        vi: entry.vi ? `(Cụm ghép với -${key}) ${entry.vi}` : 'Danh từ ghép tiếng Đức',
        source: 'compound',
        reason: `Từ ghép kết thúc bằng "-${key}" (mang giống của từ cuối: ${entry.gender})`
      };
    }
  }

  // 3. Morphological Suffix Rules
  for (const rule of SUFFIX_RULES) {
    if (lower.endsWith(rule.suffix) && lower.length > rule.suffix.length + 1) {
      return {
        word: clean,
        gender: rule.gender,
        article: rule.gender,
        plural: rule.gender === 'die' ? '-(e)n' : rule.gender === 'das' ? '-' : '-e',
        vi: '',
        source: 'suffix',
        reason: rule.reason
      };
    }
  }

  // 4. Preceding article contextual detection
  if (prevWord) {
    const cleanPrev = prevWord.replace(/^[^a-zA-ZäöüßÄÖÜ]+|[^a-zA-ZäöüßÄÖÜ]+$/g, '').toLowerCase();
    if (ARTICLE_MAP[cleanPrev]) {
      const deducedGender = ARTICLE_MAP[cleanPrev];
      return {
        word: clean,
        gender: deducedGender,
        article: deducedGender,
        plural: '',
        vi: '',
        source: 'context',
        reason: `Mạo từ đứng trước "${cleanPrev}" gợi ý giống ${deducedGender}`
      };
    }
  }

  return null;
}

/**
 * Returns Tailwind CSS styling classes based on German noun gender
 * 
 * @param {'der'|'die'|'das'|'die_pl'} gender 
 * @returns {object} Object with text, badge, border, and light/dark color definitions
 */
export function getGenderStyles(gender) {
  switch (gender) {
    case 'der':
      return {
        label: 'Maskulin (der)',
        article: 'der',
        colorName: 'sky',
        pillClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25',
        badgeClass: 'bg-sky-500 text-slate-950 font-bold',
        textClass: 'text-sky-300 font-semibold underline decoration-sky-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-sky-500/50',
        bgClass: 'bg-sky-950/40'
      };
    case 'die':
      return {
        label: 'Feminin (die)',
        article: 'die',
        colorName: 'rose',
        pillClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25',
        badgeClass: 'bg-rose-500 text-slate-950 font-bold',
        textClass: 'text-rose-300 font-semibold underline decoration-rose-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-rose-500/50',
        bgClass: 'bg-rose-950/40'
      };
    case 'das':
      return {
        label: 'Neutral (das)',
        article: 'das',
        colorName: 'emerald',
        pillClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25',
        badgeClass: 'bg-emerald-500 text-slate-950 font-bold',
        textClass: 'text-emerald-300 font-semibold underline decoration-emerald-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-emerald-500/50',
        bgClass: 'bg-emerald-950/40'
      };
    case 'die_pl':
      return {
        label: 'Plural (die Pl.)',
        article: 'die',
        colorName: 'purple',
        pillClass: 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25',
        badgeClass: 'bg-purple-500 text-white font-bold',
        textClass: 'text-purple-300 font-semibold underline decoration-purple-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-purple-500/50',
        bgClass: 'bg-purple-950/40'
      };
    default:
      return {
        label: 'Noun',
        article: '',
        colorName: 'slate',
        pillClass: 'bg-slate-700/50 text-slate-300 border-slate-600',
        badgeClass: 'bg-slate-600 text-slate-200',
        textClass: 'text-slate-200',
        borderClass: 'border-slate-700',
        bgClass: 'bg-slate-800'
      };
  }
}
