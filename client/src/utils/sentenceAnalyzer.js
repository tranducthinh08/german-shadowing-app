/**
 * Sentence Syntactic & Grammatical Analyzer
 * 
 * Analyzes German (and English) sentences into structured syntactic blocks:
 * 1. Subjekt (Subject)
 * 2. Prädikat / Verb (Main verb, auxiliary, modal verb, separable prefix / trennbare Verben, Partizip II)
 * 3. Objekt (Akkusativ, Dativ)
 * 4. Angaben (Temporal, Lokal, Modal adverbials)
 * 5. Word Order (Satzbau rules: V2 rule, Inversion, V1 Questions, Nebensatz verb-final)
 * 6. Nouns & Genders summary table
 */

import { getGermanNounInfo, GERMAN_NOUN_DICTIONARY } from './germanGrammar.js';
import {
  GERMAN_SUBJECT_PRONOUNS,
  GERMAN_AKKUSATIV_PRONOUNS,
  GERMAN_DATIV_PRONOUNS,
  GERMAN_W_WORDS,
  GERMAN_SUBORDINATING_CONJUNCTIONS,
  SEPARABLE_PREFIXES,
  MODAL_VERBS_STEMS,
  GERMAN_VERB_CONJUGATIONS,
  GERMAN_ADVERBIALS
} from "../data/germanGrammarConstants.js";

/**
 * Tokenize a sentence into words while tracking original punctuation
 */
function tokenizeWords(sentence) {
  const words = [];
  const regex = /([a-zA-ZäöüßÄÖÜ]+)/g;
  let match;
  let index = 0;

  while ((match = regex.exec(sentence)) !== null) {
    words.push({
      text: match[1],
      index: index++,
      startIndex: match.index,
      endIndex: match.index + match[1].length
    });
  }
  return words;
}

/**
 * Analyze a German sentence structure
 */
export function analyzeGermanSentence(sentenceText) {
  if (!sentenceText || !sentenceText.trim()) return null;

  const rawTokens = tokenizeWords(sentenceText);
  if (rawTokens.length === 0) return null;

  const tokens = rawTokens.map((t, i) => {
    const lower = t.text.toLowerCase();
    const prevWord = i > 0 ? rawTokens[i - 1].text : '';
    const nounInfo = getGermanNounInfo(t.text, prevWord);

    return {
      ...t,
      lower,
      nounInfo,
      role: 'Other',
      roleVi: '',
      color: 'slate',
      details: null
    };
  });

  const isQuestion = sentenceText.includes('?');
  const firstWord = tokens[0]?.lower || '';
  const lastWord = tokens[tokens.length - 1]?.lower || '';

  let detectedSubject = null;
  let detectedMainVerb = null;
  let detectedSeparablePrefix = null;
  let detectedModalVerb = null;
  let detectedInfinitiveOrPartizip = null;
  let detectedObjects = [];
  let detectedAdverbs = [];
  let nounsInSentence = [];

  // Check if last word is a separable prefix (e.g., "Ich rufe dich AN")
  if (tokens.length > 2 && SEPARABLE_PREFIXES.has(lastWord)) {
    detectedSeparablePrefix = tokens[tokens.length - 1];
    detectedSeparablePrefix.role = 'Präfix (Tiền tố tách)';
    detectedSeparablePrefix.roleVi = 'Tiền tố tách của động từ (đứng cuối câu)';
    detectedSeparablePrefix.color = 'amber';
  }

  // Scan tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const { lower, nounInfo } = token;

    // Collect all nouns
    if (nounInfo) {
      nounsInSentence.push(nounInfo);
    }

    // Skip separable prefix handled above
    if (detectedSeparablePrefix && i === tokens.length - 1) continue;

    // 1. Check for Question word (W-Wort)
    if (i === 0 && GERMAN_W_WORDS.has(lower)) {
      token.role = 'W-Frage (Từ để hỏi)';
      token.roleVi = 'Từ để hỏi';
      token.color = 'purple';
      continue;
    }

    // 2. Check for Subject pronouns
    if (GERMAN_SUBJECT_PRONOUNS.has(lower) && !detectedSubject) {
      detectedSubject = token;
      token.role = 'Subjekt (Chủ ngữ)';
      token.roleVi = 'Chủ ngữ (Người / Vật thực hiện hành động)';
      token.color = 'blue';
      continue;
    }

    // 3. Check for Modal Verb
    if (MODAL_VERBS_STEMS.has(lower) && !detectedModalVerb && !detectedMainVerb) {
      detectedModalVerb = token;
      token.role = 'Modalverb (Động từ khuyết thiếu)';
      token.roleVi = 'Động từ tình thái (kann, muss, möchte...)';
      token.color = 'emerald';
      continue;
    }

    // 4. Check for Main conjugated Verb
    if (GERMAN_VERB_CONJUGATIONS[lower] && !detectedMainVerb) {
      detectedMainVerb = token;
      token.role = 'Prädikat (Vị ngữ / Động từ)';
      token.roleVi = `Động từ chia thì ${GERMAN_VERB_CONJUGATIONS[lower].tense}`;
      token.color = 'emerald';
      token.details = GERMAN_VERB_CONJUGATIONS[lower];
      continue;
    }

    // 5. Check for End-of-clause Infinitive or Partizip II
    if (i === tokens.length - 1 || (detectedSeparablePrefix && i === tokens.length - 2)) {
      if (lower.endsWith('en') && (detectedModalVerb || detectedMainVerb?.lower === 'werde')) {
        detectedInfinitiveOrPartizip = token;
        token.role = 'Infinitiv (Động từ nguyên thể)';
        token.roleVi = 'Động từ nguyên thể đứng cuối câu (đi cùng Modalverb)';
        token.color = 'teal';
        continue;
      }
      if (lower.startsWith('ge') && lower.endsWith('t') || lower.endsWith('en')) {
        if (detectedMainVerb && (detectedMainVerb.lower.startsWith('hab') || detectedMainVerb.lower.startsWith('ist') || detectedMainVerb.lower.startsWith('bin') || detectedMainVerb.lower.startsWith('sind'))) {
          detectedInfinitiveOrPartizip = token;
          token.role = 'Partizip II (Quá khứ phân từ)';
          token.roleVi = 'Dạng quá khứ phân từ trong thì hoàn thành Perfekt';
          token.color = 'teal';
          continue;
        }
      }
    }

    // 6. Check for Akkusativ Object Pronouns
    if (GERMAN_AKKUSATIV_PRONOUNS.has(lower) && token !== detectedSubject) {
      token.role = 'Objekt (Akkusativ)';
      token.roleVi = 'Tân ngữ trực tiếp (Akkusativ - trả lời câu hỏi Wen/Was?)';
      token.color = 'indigo';
      detectedObjects.push(token);
      continue;
    }

    // 7. Check for Dativ Object Pronouns
    if (GERMAN_DATIV_PRONOUNS.has(lower) && token !== detectedSubject) {
      token.role = 'Objekt (Dativ)';
      token.roleVi = 'Tân ngữ gián tiếp (Dativ - trả lời câu hỏi Wem?)';
      token.color = 'violet';
      detectedObjects.push(token);
      continue;
    }

    // 8. Check for Adverbials
    if (GERMAN_ADVERBIALS[lower]) {
      const adv = GERMAN_ADVERBIALS[lower];
      token.role = `Angabe (${adv.type})`;
      token.roleVi = `Trạng từ ${adv.type === 'Temporal' ? 'thời gian' : adv.type === 'Lokal' ? 'nơi chốn' : 'cách thức'}: "${adv.vi}"`;
      token.color = 'cyan';
      detectedAdverbs.push(token);
      continue;
    }

    // 9. Noun without assigned role
    if (nounInfo) {
      // If no subject yet and at start, might be subject
      if (!detectedSubject && i <= 1) {
        detectedSubject = token;
        token.role = 'Subjekt (Chủ ngữ - Danh từ)';
        token.roleVi = `Chủ ngữ là danh từ: ${nounInfo.article} ${nounInfo.word}`;
        token.color = 'blue';
      } else {
        token.role = `Nomen (${nounInfo.gender})`;
        token.roleVi = `Danh từ giống ${nounInfo.gender}: ${nounInfo.word}`;
        token.color = nounInfo.gender === 'der' ? 'sky' : nounInfo.gender === 'die' ? 'rose' : 'emerald';
      }
    }
  }

  // Satzbau (Word Order) Rule Explanation
  let satzbauExplanation = {
    title: 'Quy tắc vị trí động từ thứ 2 (Verb Position 2 - V2)',
    rule: 'Trong câu trần thuật tiếng Đức, động từ chia luôn luôn đứng ở vị trí thứ 2 (Position 2). Vị trí 1 có thể là Chủ ngữ hoặc Trạng ngữ.',
    type: 'V2_NORMAL'
  };

  if (isQuestion) {
    if (GERMAN_W_WORDS.has(firstWord)) {
      satzbauExplanation = {
        title: 'Câu hỏi có từ để hỏi (W-Frage)',
        rule: 'Từ để hỏi (Wer, Was, Wie, Wo...) đứng ở vị trí 1, động từ chia đứng ở vị trí 2, theo sau là chủ ngữ.',
        type: 'W_FRAGE'
      };
    } else {
      satzbauExplanation = {
        title: 'Câu hỏi Có/Không (Ja/Nein-Frage - V1)',
        rule: 'Động từ chia được đảo lên đầu câu (Vị trí 1), theo sau ngay lập tức là Chủ ngữ.',
        type: 'JA_NEIN_FRAGE'
      };
    }
  } else if (GERMAN_SUBORDINATING_CONJUNCTIONS.has(firstWord)) {
    satzbauExplanation = {
      title: 'Mệnh đề phụ với liên từ phụ thuộc (Nebensatz)',
      rule: `Liên từ "${firstWord}" đẩy động từ chia xuống đứng ở vị trí cuối cùng của mệnh đề.`,
      type: 'NEBENSATZ'
    };
  } else if (detectedAdverbs.length > 0 && tokens[0] === detectedAdverbs[0]) {
    satzbauExplanation = {
      title: 'Hiện tượng đảo ngữ (Inversion sau Trạng từ)',
      rule: `Trạng từ "${tokens[0].text}" đứng ở vị trí 1 để nhấn mạnh -> Động từ chia vẫn giữ vị trí 2, Chủ ngữ bị đảo ra đứng sau động từ.`,
      type: 'INVERSION'
    };
  }

  // Trennbare verb combined note
  let trennbarNote = null;
  if (detectedSeparablePrefix && detectedMainVerb) {
    const infBase = detectedMainVerb.details?.inf || detectedMainVerb.lower;
    const combinedInf = `${detectedSeparablePrefix.lower}${infBase}`;
    trennbarNote = {
      prefix: detectedSeparablePrefix.text,
      mainVerb: detectedMainVerb.text,
      infinitive: combinedInf,
      explanation: `Động từ gốc là "${combinedInf}". Trong câu chính ở thì hiện tại, tiền tố "${detectedSeparablePrefix.text}" bị tách và chuyển xuống cuối câu, trong khi thân động từ "${detectedMainVerb.text}" đứng ở vị trí thứ 2.`
    };
  }

  return {
    sentenceText,
    language: 'de',
    tokens,
    detectedSubject,
    detectedMainVerb,
    detectedModalVerb,
    detectedSeparablePrefix,
    detectedInfinitiveOrPartizip,
    detectedObjects,
    detectedAdverbs,
    nounsInSentence,
    satzbauExplanation,
    trennbarNote
  };
}

/**
 * Fallback analyzer for English sentences
 */
export function analyzeEnglishSentence(sentenceText) {
  if (!sentenceText || !sentenceText.trim()) return null;

  const rawTokens = tokenizeWords(sentenceText);
  if (rawTokens.length === 0) return null;

  const ENGLISH_PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they']);
  const ENGLISH_MODALS = new Set(['can', 'could', 'should', 'would', 'must', 'will', 'may', 'might']);
  const ENGLISH_AUX = new Set(['is', 'are', 'am', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did']);

  const tokens = rawTokens.map((t, i) => {
    const lower = t.text.toLowerCase();
    let role = 'Other';
    let roleVi = '';
    let color = 'slate';

    if (ENGLISH_PRONOUNS.has(lower) && i <= 1) {
      role = 'Subject (Chủ ngữ)';
      roleVi = 'Đại từ nhân xưng đóng vai trò chủ ngữ';
      color = 'blue';
    } else if (ENGLISH_MODALS.has(lower)) {
      role = 'Modal Verb (Động từ khuyết thiếu)';
      roleVi = 'Động từ tình thái';
      color = 'emerald';
    } else if (ENGLISH_AUX.has(lower)) {
      role = 'Auxiliary Verb (Trợ động từ)';
      roleVi = 'Trợ động từ';
      color = 'teal';
    }

    return {
      ...t,
      lower,
      role,
      roleVi,
      color
    };
  });

  return {
    sentenceText,
    language: 'en',
    tokens,
    satzbauExplanation: {
      title: 'Cấu trúc S-V-O cơ bản trong tiếng Anh',
      rule: 'Thứ tự từ tiêu chuẩn là Chủ ngữ (Subject) + Động từ (Verb) + Tân ngữ (Object).',
      type: 'SVO'
    },
    nounsInSentence: []
  };
}

/**
 * Universal grammar analyzer
 */
export function analyzeSentenceGrammar(sentenceText, lang = 'de') {
  if (lang === 'de') {
    return analyzeGermanSentence(sentenceText);
  }
  return analyzeEnglishSentence(sentenceText);
}
