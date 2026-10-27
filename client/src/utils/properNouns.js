/**
 * Helper to identify and extract proper nouns (names of people, places, brands)
 * to provide hints to learners during dictation exercises.
 */

const COMMON_GERMAN_PROPER_NOUNS = new Set([
  // Nicos Weg & German Course Main Characters
  'nico', 'lisa', 'lena', 'emma', 'yara', 'sebastian', 'tarek', 'inge', 'max', 'nina',
  'nawin', 'jacques', 'cihan', 'pepe', 'sarah', 'selma', 'melvin', 'marian', 'alok', 'susi',
  'lotte', 'tanja', 'klaus', 'anna', 'maria', 'rené', 'rene', 'tom', 'martina', 'tillmanns',
  'scholl', 'kamp', 'gonzalez', 'gonzález', 'marvin', 'ulla', 'yanis', 'kohlhaas', 'grube',
  'mark', 'leli', 'brunner', 'santos', 'nowak', 'kowalski', 'shekhar', 'al-hassan', 'perez',

  // Top German & European First Names (Male)
  'alexander', 'andreas', 'anton', 'ben', 'bernd', 'christian', 'daniel', 'david', 'dieter',
  'dirk', 'elias', 'emil', 'erik', 'eric', 'fabian', 'felix', 'finn', 'fynn', 'florian',
  'frank', 'gerd', 'günther', 'hannes', 'hans', 'heinz', 'helmut', 'henry', 'holger', 'horst',
  'jan', 'jannik', 'jens', 'johannes', 'jonas', 'jörg', 'julian', 'jürgen', 'karl', 'karsten',
  'kevin', 'klaus', 'lars', 'leon', 'liam', 'louis', 'luca', 'lucas', 'luis', 'lukas',
  'manfred', 'marcel', 'marco', 'markus', 'marcus', 'martin', 'matthias', 'max', 'maximilian',
  'michael', 'moritz', 'niklas', 'noah', 'oliver', 'oskar', 'paul', 'peter', 'philipp',
  'ralf', 'ralph', 'samuel', 'sebastian', 'simon', 'stefan', 'stephan', 'sven', 'theo',
  'thomas', 'thorsten', 'tim', 'tobias', 'torsten', 'uwe', 'walter', 'werner', 'wolfgang',

  // Top German & European First Names (Female)
  'amalia', 'amelie', 'anna', 'anke', 'annika', 'birgit', 'charlotte', 'christa', 'christina',
  'clara', 'claudia', 'elena', 'elisa', 'emilia', 'emily', 'emilie', 'emma', 'erika',
  'franziska', 'frieda', 'frida', 'gisela', 'greta', 'hanna', 'hannah', 'heike', 'helga',
  'ida', 'ingrid', 'jessica', 'johanna', 'julia', 'karin', 'katharina', 'katja', 'klara',
  'lara', 'laura', 'lea', 'lena', 'leoni', 'leonie', 'lilli', 'lilly', 'lina', 'lisa',
  'lotte', 'louisa', 'luisa', 'maja', 'maya', 'marie', 'maria', 'martina', 'mathilda',
  'matilda', 'melanie', 'melina', 'mia', 'mila', 'monika', 'nadine', 'nele', 'neele',
  'nicole', 'paula', 'petra', 'pia', 'renate', 'sabine', 'sabrina', 'sandra', 'sara',
  'sarah', 'sofia', 'sophia', 'sophie', 'stefanie', 'stephanie', 'susanne', 'teresa',
  'theresa', 'ursula', 'vanessa', 'victoria', 'viktoria', 'zoe', 'zoé',

  // Common German & European Surnames
  'bauer', 'becker', 'braun', 'fischer', 'hartmann', 'hoffmann', 'klein', 'koch', 'krause',
  'krüger', 'lange', 'lehmann', 'mayer', 'meier', 'meyer', 'müller', 'neumann', 'richter',
  'schäfer', 'schmid', 'schmidt', 'schmitt', 'schmitz', 'schneider', 'schröder', 'schulz',
  'schwarz', 'wagner', 'weber', 'werner', 'wolf', 'zimmermann',

  // Places, Countries, Capitals & Continents
  'aachen', 'amerika', 'argentinien', 'asien', 'augsburg', 'australien', 'barcelona',
  'berlin', 'bern', 'bonn', 'brasilien', 'bremen', 'china', 'damaskus', 'deutschland',
  'dresden', 'düsseldorf', 'england', 'europa', 'frankfurt', 'frankreich', 'freiburg',
  'griechenland', 'hamburg', 'hannover', 'hanoi', 'indien', 'italien', 'japan', 'kanada',
  'karlsruhe', 'köln', 'leipzig', 'london', 'madrid', 'münchen', 'münster', 'new york',
  'norwegen', 'nürnberg', 'österreich', 'paris', 'peking', 'polen', 'potsdam', 'rom',
  'russland', 'schweiz', 'schweden', 'sevilla', 'spanien', 'stuttgart', 'syrien',
  'thailand', 'tokio', 'türkei', 'vietnam', 'wien', 'wiesbaden', 'zürich'
]);

const COMMON_ENGLISH_PROPER_NOUNS = new Set([
  'john', 'mary', 'lisa', 'david', 'james', 'michael', 'robert', 'william', 'sarah', 'emily',
  'jessica', 'ashley', 'taylor', 'charlotte', 'olivia', 'sophia', 'amelia', 'george', 'harry',
  'jack', 'jacob', 'charlie', 'thomas', 'oscar', 'william', 'oliver', 'henry', 'leo', 'arthur',
  'central', 'café', 'starbucks', 'london', 'new york', 'paris', 'america', 'england',
  'germany', 'france', 'spain', 'italy', 'japan', 'china', 'vietnam', 'australia', 'sydney'
]);

// Common German greeting words and salutations
const GERMAN_GREETINGS = new Set([
  'hey', 'hallo', 'hi', 'tschüss', 'ciao', 'servus', 'na', 'danke', 'bitte', 'liebe', 'lieber', 'moin'
]);

// Common non-name words that might follow greetings or be capitalized at clause start
const GERMAN_NON_NAME_WORDS = new Set([
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'und', 'aber', 'denn', 'oder', 'wie', 'was',
  'wo', 'wann', 'warum', 'wer', 'doch', 'ja', 'nein', 'so', 'da', 'hier', 'dort', 'alles',
  'nichts', 'etwas', 'nicht', 'sehr', 'gut', 'schön', 'toll', 'fertig', 'müde', 'klar',
  'willkommen', 'guten', 'gute', 'morgen', 'tag', 'abend', 'nacht'
]);

/**
 * Remove all punctuation including Unicode quotes and apostrophes
 */
function cleanBoundaryPunctuation(str = '') {
  return str.replace(
    /^[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«–—…\u2019\u2018\u02BC\u201A\u2032]+|[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«–—…\u2019\u2018\u02BC\u201A\u2032]+$/g,
    ''
  );
}

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
    const cleanWord = cleanBoundaryPunctuation(rawWord);
    if (!cleanWord || cleanWord.length < 2) continue;

    const lower = cleanWord.toLowerCase();

    // Check direct dictionary match
    if (lang === 'de' && COMMON_GERMAN_PROPER_NOUNS.has(lower)) {
      foundNames.add(cleanWord);
      continue;
    }
    if (lang === 'en' && COMMON_ENGLISH_PROPER_NOUNS.has(lower)) {
      foundNames.add(cleanWord);
      continue;
    }

    // Check genitive form in German (e.g. "Nicos", "Nico's", "Lisas", "Lisa's")
    if (lang === 'de') {
      const baseName = lower.replace(/[\u2019']s$/i, '').replace(/s$/i, '');
      if (baseName.length >= 3 && COMMON_GERMAN_PROPER_NOUNS.has(baseName)) {
        foundNames.add(cleanWord);
        continue;
      }
    }

    // Contextual detection in German:
    if (lang === 'de' && i > 0) {
      const prevWord = cleanBoundaryPunctuation(rawWords[i - 1]);
      const prevLower = prevWord.toLowerCase();

      // 1. Words following titles: "Herr", "Frau", "Herrn", "Dr.", "Prof."
      if (['herr', 'frau', 'herrn', 'dr', 'prof', 'kollege', 'kollegin'].includes(prevLower)) {
        if (/^[A-ZÄÖÜ]/.test(cleanWord)) {
          foundNames.add(cleanWord);
          continue;
        }
      }

      // 2. Words following greetings: "Hey, Lena", "Hallo, Sarah", "Hi, Max", "Na, Lena"
      if (GERMAN_GREETINGS.has(prevLower) && /^[A-ZÄÖÜ][a-zäöüß]+$/.test(cleanWord)) {
        if (!GERMAN_NON_NAME_WORDS.has(lower)) {
          foundNames.add(cleanWord);
          continue;
        }
      }

      // 3. Name introduction phrases: "heiße [Name]", "heißt [Name]", "Name ist [Name]", "bin [Name]"
      if (['heiße', 'heißt'].includes(prevLower) && /^[A-ZÄÖÜ][a-zäöüß]+$/.test(cleanWord)) {
        if (!GERMAN_NON_NAME_WORDS.has(lower)) {
          foundNames.add(cleanWord);
          continue;
        }
      }
    }

    // In English, capitalized words not at the beginning of sentence are usually proper nouns
    if (lang === 'en' && i > 0 && /^[A-Z][a-z]+$/.test(cleanWord)) {
      if (cleanWord !== 'I' && !['The', 'A', 'An', 'And', 'But', 'Or', 'So'].includes(cleanWord)) {
        foundNames.add(cleanWord);
      }
    }
  }

  return Array.from(foundNames);
}
