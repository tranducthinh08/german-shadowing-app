import { normalizeGerman } from './germanUtils.js';

/**
 * Remove standard and unicode punctuation from a word for relaxed matching
 */
export function cleanPunctuation(str = '') {
  return str.replace(
    /^[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«–—…\u2019\u2018\u02BC\u201A\u2032]+|[.,/#!$%^&*;:{}=\-_`~()?"'„“”»«–—…\u2019\u2018\u02BC\u201A\u2032]+$/g,
    ''
  );
}

/**
 * Normalize curly/typographic apostrophes and spaces before punctuation marks
 */
export function normalizeContractionsAndPunctuation(str = '') {
  return str
    .replace(/[\u2019\u2018`\u00B4\u02BC\u201A\u2032]/g, "'") // unify all apostrophe variants to standard single quote '
    .replace(/\s+([.,!?:;])/g, '$1') // eliminate spaces before punctuation (e.g. "Lena !" -> "Lena!")
    .replace(/(\w+)\s+'s\b/gi, "$1's"); // attach detached 's (e.g. "geht 's" -> "geht's")
}

/**
 * Unify all apostrophes to ASCII single quote
 */
function normalizeApos(w = '') {
  return w.replace(/[\u2019\u2018`\u00B4\u02BC\u201A\u2032]/g, "'");
}

/**
 * Strip umlauts to base latin letters (e.g. ü -> u, ö -> o, ä -> a)
 */
function stripUmlauts(str = '') {
  return str
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U');
}

/**
 * Levenshtein distance between two strings
 */
function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));
  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;
  for (let j = 0; j <= an; ++j) matrix[0][j] = j;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Check if two words are a match or close typo, with full tolerance for apostrophe 's / ’s
 */
function isWordMatchOrClose(w1, w2) {
  const w1AposNorm = normalizeApos(w1);
  const w2AposNorm = normalizeApos(w2);
  const w1Low = w1AposNorm.toLowerCase();
  const w2Low = w2AposNorm.toLowerCase();

  // 1. Direct or case-insensitive match
  if (w1Low === w2Low) {
    return { match: true, typoType: w1AposNorm === w2AposNorm ? null : 'case' };
  }

  // 2. Tolerance for 's / ’s / s / omitted 's (e.g. geht's == geht == gehts == geht's)
  // Only applies when at least one word has an apostrophe
  const hasApos = w1Low.includes("'") || w2Low.includes("'");
  if (hasApos) {
    const stem1 = w1Low.replace(/'s$/, '').replace(/s$/, '');
    const stem2 = w2Low.replace(/'s$/, '').replace(/s$/, '');
    if (stem1 && stem1.length >= 2 && stem1 === stem2) {
      const stemRaw1 = w1AposNorm.replace(/'s$/i, '').replace(/s$/i, '');
      const stemRaw2 = w2AposNorm.replace(/'s$/i, '').replace(/s$/i, '');
      return { match: true, typoType: stemRaw1 === stemRaw2 ? null : 'case' };
    }
  }

  // 3. German Umlaut checks (e.g. ue -> ü, ae -> ä)
  if (normalizeGerman(w1Low) === normalizeGerman(w2Low) || stripUmlauts(w1Low) === stripUmlauts(w2Low)) {
    return { match: true, typoType: 'umlaut' };
  }

  // 4. Levenshtein close typo check (threshold 1 for short words, 2 for longer)
  const dist = levenshtein(w1Low, w2Low);
  const maxAllowedDist = w1Low.length > 5 ? 2 : (w1Low.length > 3 ? 1 : 0);
  if (dist <= maxAllowedDist) {
    return { match: true, typoType: 'spelling' };
  }

  return { match: false, typoType: null };
}

/**
 * Compare user input against target ground truth sentence
 * @param {string} userText
 * @param {string} targetText
 * @param {object} options { strictCase: boolean, strictGermanUmlauts: boolean }
 */
export function compareSentence(userText = '', targetText = '', options = {}) {
  const { strictCase = false, strictGermanUmlauts = true } = options;

  const normalizedUserText = normalizeContractionsAndPunctuation(userText);
  const normalizedTargetText = normalizeContractionsAndPunctuation(targetText);

  const targetWords = normalizedTargetText.trim().split(/\s+/).filter(Boolean);
  // Filter out standalone punctuation tokens so typing " !" or "?" standalone does not count as "Từ thừa"
  const userWords = normalizedUserText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => cleanPunctuation(w).length > 0);

  if (targetWords.length === 0) {
    return {
      tokens: [],
      score: 100,
      correctCount: 0,
      totalCount: 0,
      isPerfect: true
    };
  }

  // Token list for displaying diff
  const tokens = [];
  let correctCount = 0;

  // Align words using Longest Common Subsequence on cleaned words
  const n = targetWords.length;
  const m = userWords.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const twClean = cleanPunctuation(targetWords[i - 1]);
      const uwClean = cleanPunctuation(userWords[j - 1]);
      const check = isWordMatchOrClose(twClean, uwClean);

      if (check.match) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build aligned tokens
  let i = n;
  let j = m;
  const alignment = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const tw = targetWords[i - 1];
      const uw = userWords[j - 1];
      const twClean = cleanPunctuation(tw);
      const uwClean = cleanPunctuation(uw);
      const check = isWordMatchOrClose(twClean, uwClean);

      if (check.match) {
        alignment.unshift({ type: 'match', targetWord: tw, userWord: uw, typoType: check.typoType });
        i--;
        j--;
        continue;
      }
    }

    if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      alignment.unshift({ type: 'extra', userWord: userWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      alignment.unshift({ type: 'missing', targetWord: targetWords[i - 1] });
      i--;
    }
  }

  // Process aligned tokens into user-friendly statuses
  for (const item of alignment) {
    if (item.type === 'match') {
      const tw = item.targetWord;
      const uw = item.userWord;
      const twClean = cleanPunctuation(tw);

      if (!item.typoType) {
        tokens.push({
          word: tw,
          userInput: uw,
          status: 'correct',
          label: 'Chính xác'
        });
        correctCount++;
      } else if (item.typoType === 'case') {
        tokens.push({
          word: tw,
          userInput: uw,
          status: strictCase ? 'typo' : 'correct',
          note: 'Sai chữ hoa/thường (Tiếng Đức yêu cầu viết hoa danh từ)',
          label: strictCase ? 'Sai chữ hoa/thường' : 'Chính xác'
        });
        if (!strictCase) {
          correctCount++;
        } else {
          correctCount += 0.7;
        }
      } else if (item.typoType === 'umlaut') {
        tokens.push({
          word: twClean || tw,
          userInput: uw,
          status: 'typo',
          note: 'Thiếu hoặc sai dấu Umlaut (ä, ö, ü, ß)',
          label: 'Thiếu dấu Umlaut'
        });
        correctCount += 0.7;
      } else {
        // Spelling typo - display cleaned target word to avoid confusing punctuation in badge
        tokens.push({
          word: twClean || tw,
          userInput: uw,
          status: 'typo',
          note: 'Sai chính tả nhẹ',
          label: 'Sai chính tả'
        });
        correctCount += 0.5;
      }
    } else if (item.type === 'missing') {
      tokens.push({
        word: item.targetWord,
        userInput: '',
        status: 'missing',
        label: 'Từ bị thiếu'
      });
    } else if (item.type === 'extra') {
      tokens.push({
        word: '',
        userInput: item.userWord,
        status: 'extra',
        label: 'Từ thừa'
      });
    }
  }

  const exactCorrectCount = tokens.filter((t) => t.status === 'correct').length;
  const typoCount = tokens.filter((t) => t.status === 'typo').length;
  const score = Math.round(Math.min(100, Math.max(0, (correctCount / targetWords.length) * 100)));
  const isPerfect = score === 100 && userWords.length === targetWords.length;

  return {
    tokens,
    score,
    correctCount: exactCorrectCount,
    typoCount,
    totalCount: targetWords.length,
    isPerfect
  };
}

/**
 * Compute real-time word-by-word streaming validation against target script
 * @param {string} userInput - Current text in the input box
 * @param {string} targetText - Target sentence text
 * @param {object} options - { strictCase: boolean, strictGermanUmlauts: boolean }
 */
export function computeLiveStream(userInput = '', targetText = '', options = {}) {
  const strictCase = Boolean(options.strictCase || options.strictGerman);

  const normUser = normalizeContractionsAndPunctuation(userInput);
  const normTarget = normalizeContractionsAndPunctuation(targetText);

  const targetWords = normTarget.trim().split(/\s+/).filter(Boolean);
  if (targetWords.length === 0) {
    return { tokens: [], matchedCount: 0, totalCount: 0, isComplete: false, score: 0 };
  }

  // Filter out standalone punctuation tokens
  const userWords = normUser
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => cleanPunctuation(w).length > 0);

  // Check if user is actively in the middle of typing the last word (no trailing space)
  const isTypingLastWord = !/\s$/.test(userInput) && userWords.length > 0;

  const tokens = [];
  let matchedCount = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const tw = targetWords[i];
    const twClean = cleanPunctuation(tw);
    const uw = userWords[i];

    if (!uw) {
      tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: '', status: 'pending' });
      continue;
    }

    const uwClean = cleanPunctuation(uw);
    const isCurrentActive = isTypingLastWord && i === userWords.length - 1;

    // 1. If actively typing the last word, prioritize exact or prefix matching (e.g. "hall" in "Hallo")
    if (isCurrentActive) {
      const twLow = twClean.toLowerCase();
      const uwLow = uwClean.toLowerCase();
      const twNoUmlaut = stripUmlauts(twLow);
      const uwNoUmlaut = stripUmlauts(uwLow);

      const isExactMatch = twLow === uwLow || twNoUmlaut === uwNoUmlaut;
      const isPrefixMatch = twLow.startsWith(uwLow) || twNoUmlaut.startsWith(uwNoUmlaut);

      if (isExactMatch) {
        if (strictCase && twClean !== uwClean) {
          tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'typo' });
        } else {
          tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'correct' });
          matchedCount++;
        }
        continue;
      }

      if (isPrefixMatch) {
        tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'typing' });
        continue;
      }
    }

    // 2. Full word evaluation (or inactive/submitted words)
    const check = isWordMatchOrClose(twClean, uwClean);

    if (check.match) {
      if (check.typoType === 'case') {
        if (strictCase) {
          tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'typo' });
        } else {
          tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'correct' });
          matchedCount++;
        }
      } else if (check.typoType === 'umlaut' || check.typoType === 'spelling') {
        // Spelling mistake or missing umlaut must be treated as wrong, not correct
        tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'wrong' });
      } else {
        // Pure match
        tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'correct' });
        matchedCount++;
      }
    } else {
      tokens.push({ targetWord: tw, cleanTarget: twClean, typedWord: uw, status: 'wrong' });
    }
  }

  // Check for any extra words typed beyond target words count
  if (userWords.length > targetWords.length) {
    for (let j = targetWords.length; j < userWords.length; j++) {
      tokens.push({
        targetWord: '',
        cleanTarget: '',
        typedWord: userWords[j],
        status: 'extra'
      });
    }
  }

  const isComplete = matchedCount === targetWords.length && userWords.length === targetWords.length;
  const score = Math.round((matchedCount / targetWords.length) * 100);

  return {
    tokens,
    matchedCount,
    totalCount: targetWords.length,
    isComplete,
    score
  };
}
