/**
 * Helper to identify and extract proper nouns (names of people, places, brands)
 * to provide hints to learners during dictation exercises.
 */

const COMMON_GERMAN_PROPER_NOUNS = new Set([
  // First names
  'nico', 'lisa', 'anna', 'emma', 'mia', 'hannah', 'sofia', 'marie', 'clara',
  'ben', 'paul', 'jonas', 'leon', 'finn', 'noah', 'elias', 'luis', 'lukas', 'felix', 'max',
  'jan', 'tim', 'tobias', 'florian', 'alexander', 'christian', 'stefan', 'martin', 'michael',
  // Surnames
  'müller', 'schneider', 'fischer', 'weber', 'meyer', 'wagner', 'becker', 'schulz',
  'hoffmann', 'schäfer', 'koch', 'bauer', 'richter', 'klein', 'wolf', 'schröder',
  'neumann', 'schwarz', 'zimmermann', 'braun', 'krüger', 'hartmann', 'lange', 'werner',
  'schmitz', 'krause', 'meier', 'lehmann', 'schmid', 'mayer', 'kamp',
  // Places & Countries
  'deutschland', 'österreich', 'schweiz', 'berlin', 'münchen', 'hamburg', 'köln',
  'frankfurt', 'stuttgart', 'düsseldorf', 'leipzig', 'dresden', 'wien', 'zürich',
  'bern', 'europa', 'amerika', 'frankreich', 'italien', 'spanien'
]);

const COMMON_ENGLISH_PROPER_NOUNS = new Set([
  'john', 'mary', 'lisa', 'david', 'james', 'michael', 'robert', 'william', 'sarah', 'emily',
  'jessica', 'ashley', 'taylor', 'charlotte', 'olivia', 'sophia', 'amelia',
  'central', 'café', 'starbucks', 'london', 'new york', 'paris', 'america', 'england',
  'germany', 'france', 'spain', 'italy', 'japan', 'china', 'vietnam', 'australia'
]);

/**
 * Extract proper nouns from sentence text
 * @param {string} text
 * @param {'de'|'en'} lang
 * @returns {string[]}
 */
export function extractProperNouns(text = '', lang = 'de') {
  if (!text) return [];

  const rawWords = text.trim().split(/\s+/);
  const foundNames = new Set();

  for (let i = 0; i < rawWords.length; i++) {
    const rawWord = rawWords[i];
    // Strip punctuation
    const cleanWord = rawWord.replace(/^[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«]+|[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«]+$/g, '');
    if (!cleanWord || cleanWord.length < 2) continue;

    const lower = cleanWord.toLowerCase();

    // Check against predefined famous names dictionary
    if (lang === 'de' && COMMON_GERMAN_PROPER_NOUNS.has(lower)) {
      foundNames.add(cleanWord);
      continue;
    }
    if (lang === 'en' && COMMON_ENGLISH_PROPER_NOUNS.has(lower)) {
      foundNames.add(cleanWord);
      continue;
    }

    // In German, words following titles like "Herr", "Frau", "Herrn", "Dr." are people's names
    if (lang === 'de' && i > 0) {
      const prevWord = rawWords[i - 1].replace(/^[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«]+|[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«]+$/g, '');
      if (['herr', 'frau', 'herrn', 'dr', 'prof'].includes(prevWord.toLowerCase())) {
        if (/^[A-ZÄÖÜ]/.test(cleanWord)) {
          foundNames.add(cleanWord);
          continue;
        }
      }
    }

    // In English, capitalized words not at the beginning of sentence are usually proper nouns
    if (lang === 'en' && i > 0 && /^[A-Z]/.test(cleanWord)) {
      // Exclude single letter I
      if (cleanWord !== 'I') {
        foundNames.add(cleanWord);
      }
    }
  }

  return Array.from(foundNames);
}
