/**
 * Alphabet Daily Review & Practice Engine
 * 
 * Generates tailored daily drills (listen & pick letter, minimal pairs contrast,
 * sound in context, and voice challenge) prioritizing starred and tricky sounds.
 */

import { GERMAN_ALPHABET, MINIMAL_PAIRS, getDifficultLetters, getAlphabetItemById } from '../data/germanAlphabetData.js';
import { getLocalDateString } from './timeFormat.js';

// Helper: Shuffle an array in-place
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Pick N random items from an array
function pickRandom(array, n) {
  return shuffle(array).slice(0, n);
}

/**
 * Generate a complete daily review session
 * @param {string[]} userStarredIds - List of letter IDs starred by the user
 * @param {number} questionCount - Desired number of questions (default: 8)
 * @returns {Array<object>} Array of generated questions
 */
export function generateDailyReviewSession(userStarredIds = [], questionCount = 8) {
  const questions = [];
  const difficultItems = getDifficultLetters();

  // 1. Determine priority pool: user starred letters first, then difficult items, then all
  const starredItems = (userStarredIds || [])
    .map(id => getAlphabetItemById(id))
    .filter(Boolean);

  const priorityPool = starredItems.length > 0
    ? [...starredItems, ...difficultItems.filter(d => !userStarredIds.includes(d.id))]
    : difficultItems;

  const candidatePool = shuffle(priorityPool);

  // 2. Generate Question Types

  // Type A: Minimal Pairs Contrast Drill (1 - 2 questions)
  const selectedPairs = pickRandom(MINIMAL_PAIRS, Math.min(2, MINIMAL_PAIRS.length));
  for (const pair of selectedPairs) {
    const isTargetA = Math.random() < 0.5;
    const targetItem = isTargetA ? pair.itemA : pair.itemB;
    const otherItem = isTargetA ? pair.itemB : pair.itemA;

    questions.push({
      id: `pair_${pair.id}_${Date.now()}_${Math.random()}`,
      type: 'minimal_pair',
      categoryTag: pair.tag,
      title: 'Luyện tai phân biệt cặp âm dễ nhầm',
      instruction: `Hãy nghe audio và chọn từ/âm bạn vừa nghe được:`,
      audioText: targetItem.audio,
      audioLang: 'de',
      targetLetter: targetItem.letter,
      options: shuffle([
        {
          id: 'opt_target',
          text: `${targetItem.word} (${targetItem.meaning})`,
          subtext: `Âm: ${targetItem.sound}`,
          isCorrect: true
        },
        {
          id: 'opt_other',
          text: `${otherItem.word} (${otherItem.meaning})`,
          subtext: `Âm: ${otherItem.sound}`,
          isCorrect: false
        }
      ]),
      explanation: pair.hint
    });
  }

  // Type B: Audio of Letter Name -> Pick 1 of 4 Letters
  let poolIndex = 0;
  while (questions.length < questionCount - 2 && poolIndex < candidatePool.length) {
    const item = candidatePool[poolIndex++];
    if (!item) break;

    // Pick 3 distractors from the alphabet that are different
    const distractors = GERMAN_ALPHABET
      .filter(x => x.id !== item.id)
      .slice();
    const chosenDistractors = pickRandom(distractors, 3);

    const options = shuffle([
      {
        id: `opt_${item.id}`,
        text: item.letter,
        subtext: `Tên đọc: "${item.name}" [${item.ipa}]`,
        isCorrect: true
      },
      ...chosenDistractors.map(d => ({
        id: `opt_${d.id}`,
        text: d.letter,
        subtext: `Tên đọc: "${d.name}" [${d.ipa}]`,
        isCorrect: false
      }))
    ]);

    questions.push({
      id: `pick_letter_${item.id}_${Math.random()}`,
      type: 'audio_pick_letter',
      categoryTag: item.difficultyTag || 'Chữ cái tiếng Đức',
      title: 'Nghe phát âm và đoán chữ cái',
      instruction: `Hệ thống vừa đọc tên một chữ cái tiếng Đức. Bạn nghe thấy chữ nào?`,
      audioText: item.ttsLetter || item.name,
      audioLang: 'de',
      targetLetter: item.letter,
      options,
      explanation: `Chữ "${item.letter}" có tên gọi tiếng Đức là "${item.name}" (phiên âm IPA: ${item.ipa}, đọc tựa như "${item.viApprox}"). ${item.commonMistake || item.mouthTip}`
    });
  }

  // Type C: Sound in Word Context (VD: V trong Vater đọc là gì?)
  const trickyContextItems = candidatePool.filter(i => i.isDifficult && i.examples && i.examples.length > 0);
  if (trickyContextItems.length > 0 && questions.length < questionCount) {
    const targetContext = trickyContextItems[0];
    const sampleEx = targetContext.examples[0];

    const correctSound = targetContext.viApprox;
    // Generate distractors
    const falseOptions = [
      'như âm V rung trong tiếng Việt',
      'như âm D/Z rung tiếng Việt',
      'như âm K bật hơi',
      'như âm O thông thường'
    ].filter(txt => !txt.includes(correctSound)).slice(0, 3);

    const options = shuffle([
      {
        id: 'ctx_correct',
        text: `Phát âm: ${targetContext.ipa} (${correctSound})`,
        subtext: `Mẹo: ${targetContext.mouthTip.slice(0, 45)}...`,
        isCorrect: true
      },
      ...falseOptions.map((fo, idx) => ({
        id: `ctx_false_${idx}`,
        text: `Phát âm: ${fo}`,
        subtext: 'Không chính xác',
        isCorrect: false
      }))
    ]);

    questions.push({
      id: `context_${targetContext.id}_${Math.random()}`,
      type: 'sound_context',
      categoryTag: 'Phát âm trong từ thực tế',
      title: `Chữ "${targetContext.letter}" trong từ "${sampleEx.de}" phát âm như thế nào?`,
      instruction: `Bấm nghe từ ví dụ "${sampleEx.de}" (${sampleEx.vi}) và xác định cách phát âm:`,
      audioText: sampleEx.de,
      audioLang: 'de',
      targetLetter: targetContext.letter,
      options,
      explanation: `${targetContext.commonMistake || ''} ${targetContext.mouthTip}`
    });
  }

  // Type D: Voice Challenge / Shadowing Practice (1 question)
  const voiceTarget = candidatePool.find(i => i.isDifficult && i.examples && i.examples.length > 0) || candidatePool[0] || GERMAN_ALPHABET[0];
  const voiceSample = voiceTarget.examples ? voiceTarget.examples[0] : { de: voiceTarget.name, vi: voiceTarget.viApprox };

  questions.push({
    id: `voice_${voiceTarget.id}_${Math.random()}`,
    type: 'voice_challenge',
    categoryTag: 'Thử thách phát âm qua Micro',
    title: `Luyện đọc chữ "${voiceTarget.letter}" qua Micro`,
    instruction: `Hãy nghe mẫu rồi nhấn giữ biểu tượng Micro để đọc to từ: "${voiceSample.de}" (${voiceSample.vi})`,
    targetWord: voiceSample.de,
    targetLetter: voiceTarget.letter,
    audioText: voiceSample.de,
    audioLang: 'de',
    mouthTip: voiceTarget.mouthTip,
    options: [
      {
        id: 'voice_success',
        text: `Đọc to chuẩn xác: "${voiceSample.de}"`,
        isCorrect: true
      }
    ],
    explanation: `Mẹo khẩu hình cho "${voiceTarget.letter}": ${voiceTarget.mouthTip}`
  });

  return shuffle(questions).slice(0, questionCount);
}

/**
 * Calculate updated daily review progress and streak
 * @param {object} currentProgress
 * @param {number} correctCount
 * @param {number} totalQuestions
 * @returns {object} updated progress object
 */
export function calculateReviewProgressUpdate(currentProgress, correctCount, totalQuestions) {
  const today = getLocalDateString();
  const lastDate = currentProgress?.lastReviewDate;

  let newStreak = currentProgress?.reviewStreak || 0;

  if (!lastDate) {
    // First time ever
    newStreak = 1;
  } else if (lastDate === today) {
    // Already studied today, maintain streak
    newStreak = Math.max(1, currentProgress.reviewStreak || 1);
  } else {
    // Check if consecutive day
    const d1 = new Date(lastDate);
    const d2 = new Date(today);
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1; // streak reset
    }
  }

  return {
    lastReviewDate: today,
    reviewStreak: newStreak,
    totalSessions: (currentProgress?.totalSessions || 0) + 1,
    totalQuestionsAnswered: (currentProgress?.totalQuestionsAnswered || 0) + totalQuestions,
    totalCorrect: (currentProgress?.totalCorrect || 0) + correctCount
  };
}

/**
 * Generate a deterministic seed number from date string and optional custom offset
 * @param {string} str
 * @param {number} offset
 * @returns {number}
 */
export function hashDateString(str, offset = 0) {
  let hash = 0;
  const fullStr = `${str || getLocalDateString()}_daily5_${offset || 0}`;
  for (let i = 0; i < fullStr.length; i++) {
    hash = (hash << 5) - hash + fullStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get 5 balanced featured sounds for a specific day.
 * Deterministic for each calendar day: Consistent throughout the day, auto-refreshes daily.
 * Can be rotated on-demand with customOffset.
 * 
 * Distribution:
 * - 2 Standard letters (A-Z)
 * - 1 Umlaut / Eszett (Ä, Ö, Ü, ß)
 * - 2 Crucial Clusters / Diphthongs (ei, ie, eu, ch, sch, sp, st, tsch...)
 * - Incorporates user starred letters when available.
 * 
 * @param {string} dateStr - Date string 'YYYY-MM-DD'
 * @param {number} customOffset - Manual rotation offset (0, 1, 2...)
 * @param {string[]} userStarredIds - List of user-starred letter IDs
 * @returns {Array<object>} Array of 5 alphabet objects
 */
export function getDailyFeaturedSounds(dateStr = getLocalDateString(), customOffset = 0, userStarredIds = []) {
  const seed = hashDateString(dateStr, customOffset);

  const standards = GERMAN_ALPHABET.filter(item => item.category === 'standard');
  const umlaute = GERMAN_ALPHABET.filter(item => item.category === 'umlaut');
  const clusters = GERMAN_ALPHABET.filter(item => item.category === 'cluster');

  // Deterministic pick based on seed
  const pickFromList = (list, count, seedMod) => {
    if (!list || list.length === 0) return [];
    const result = [];
    const copy = [...list];
    for (let i = 0; i < count && copy.length > 0; i++) {
      const idx = (seed + seedMod + i * 7) % copy.length;
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  };

  const selectedStandards = pickFromList(standards, 2, 11);
  const selectedUmlaut = pickFromList(umlaute, 1, 23);
  const selectedClusters = pickFromList(clusters, 2, 37);

  const featured = [...selectedStandards, ...selectedUmlaut, ...selectedClusters];

  // If user has starred letters, prioritize replacing 1-2 sounds with user's starred sounds
  const safeStarredIds = Array.isArray(userStarredIds) ? userStarredIds : [];
  if (safeStarredIds.length > 0) {
    const starredItems = safeStarredIds
      .map(id => getAlphabetItemById(id))
      .filter(item => Boolean(item) && !featured.some(f => f.id === item.id));

    if (starredItems.length > 0) {
      // Swap out the first standard item with a starred item
      featured[0] = starredItems[seed % starredItems.length];
    }
  }

  return featured;
}

/**
 * Generate a targeted 5-question review drill for the 5 daily featured sounds
 * @param {Array<object>} featuredSounds - The 5 featured alphabet items
 * @returns {Array<object>} Exactly 5 questions
 */
export function generateTargeted5Quiz(featuredSounds = []) {
  if (!featuredSounds || featuredSounds.length === 0) {
    return generateDailyReviewSession([], 5);
  }

  const sounds = [...featuredSounds];
  const questions = [];

  // Question 1: Audio Pick Letter for Sound 0
  const s0 = sounds[0];
  const distractorLetters = GERMAN_ALPHABET.filter(item => item.id !== s0.id);
  const s0Distractors = pickRandom(distractorLetters, 3);
  questions.push({
    id: `q1_daily5_${s0.id}`,
    type: 'audio_pick_letter',
    categoryTag: 'Âm tiêu điểm 1',
    title: `Luyện tai: Nghe và chọn chữ cái / âm đúng`,
    instruction: `Bấm vào biểu tượng loa để nghe phát âm, sau đó chọn chữ cái tương ứng:`,
    audioText: s0.ttsLetter || s0.name,
    audioLang: 'de',
    targetLetter: s0.letter,
    options: shuffle([
      {
        id: `opt_${s0.id}`,
        text: s0.letter,
        subtext: `IPA: ${s0.ipa} • ${s0.viApprox}`,
        isCorrect: true
      },
      ...s0Distractors.map(d => ({
        id: `opt_${d.id}`,
        text: d.letter,
        subtext: `IPA: ${d.ipa} • ${d.viApprox}`,
        isCorrect: false
      }))
    ]),
    explanation: `Chữ "${s0.letter}" đọc là "${s0.name}" (${s0.ipa}). ${s0.mouthTip}`
  });

  // Question 2: Word Context for Sound 1
  const s1 = sounds[1] || sounds[0];
  const s1Sample = s1.examples?.[0] || { de: s1.name, vi: 'Ví dụ', phonetic: s1.name };
  const s1DistractorSamples = GERMAN_ALPHABET
    .filter(item => item.id !== s1.id && item.examples?.length > 0)
    .map(item => item.examples[0]);
  const s1Distractors = pickRandom(s1DistractorSamples, 3);
  questions.push({
    id: `q2_daily5_${s1.id}`,
    type: 'sound_in_context',
    categoryTag: 'Âm tiêu điểm 2',
    title: `Nhận diện âm trong từ thực tế: "${s1.letter}"`,
    instruction: `Từ vựng tiếng Đức nào dưới đây chứa âm "${s1.letter}" (${s1.ipa})?`,
    audioText: s1Sample.de,
    audioLang: 'de',
    targetLetter: s1.letter,
    options: shuffle([
      {
        id: 'opt_s1_target',
        text: s1Sample.de,
        subtext: `${s1Sample.vi} (${s1Sample.phonetic})`,
        isCorrect: true
      },
      ...s1Distractors.map((d, i) => ({
        id: `opt_dist_${i}`,
        text: d.de,
        subtext: `${d.vi} (${d.phonetic})`,
        isCorrect: false
      }))
    ]),
    explanation: `Từ "${s1Sample.de}" (${s1Sample.vi}) chứa âm "${s1.letter}". ${s1.mouthTip}`
  });

  // Question 3: Phonetic Rule & Mouth Tip for Sound 2
  const s2 = sounds[2] || sounds[0];
  questions.push({
    id: `q3_daily5_${s2.id}`,
    type: 'mouth_tip',
    categoryTag: 'Âm tiêu điểm 3',
    title: `Quy tắc & Khẩu hình phát âm: "${s2.letter}"`,
    instruction: `Mẹo khẩu hình chuẩn xác khi phát âm âm "${s2.letter}" (${s2.ipa}) là gì?`,
    audioText: s2.ttsLetter || s2.name,
    audioLang: 'de',
    targetLetter: s2.letter,
    options: shuffle([
      {
        id: 'opt_s2_correct',
        text: s2.mouthTip,
        subtext: `Âm tương đương: ${s2.viApprox}`,
        isCorrect: true
      },
      {
        id: 'opt_s2_wrong1',
        text: 'Đọc lướt nhanh, không cần mở miệng hoặc chuyển động môi.',
        subtext: 'Sai khẩu hình',
        isCorrect: false
      },
      {
        id: 'opt_s2_wrong2',
        text: 'Phát âm hoàn toàn giống âm "k" trong tiếng Việt không rung họng.',
        subtext: 'Sai âm vị',
        isCorrect: false
      }
    ]),
    explanation: `Khẩu hình chuẩn cho "${s2.letter}": ${s2.mouthTip}`
  });

  // Question 4: Listening Discrimination for Sound 3
  const s3 = sounds[3] || sounds[0];
  const s3Sample = s3.examples?.[0] || { de: s3.name, vi: 'Ví dụ', phonetic: s3.name };
  const s3Other = distractorLetters.find(d => d.soundType === s3.soundType) || distractorLetters[0];
  const s3OtherSample = s3Other?.examples?.[0] || { de: 'Wort', vi: 'Từ ngữ', phonetic: 'Vót' };
  questions.push({
    id: `q4_daily5_${s3.id}`,
    type: 'audio_pick_letter',
    categoryTag: 'Âm tiêu điểm 4',
    title: `Phân biệt âm thanh: "${s3.letter}"`,
    instruction: `Nghe phát âm từ mẫu và chọn từ chính xác:`,
    audioText: s3Sample.de,
    audioLang: 'de',
    targetLetter: s3.letter,
    options: shuffle([
      {
        id: 'opt_s3_target',
        text: `${s3Sample.de} (${s3Sample.vi})`,
        subtext: `Chứa âm: ${s3.letter}`,
        isCorrect: true
      },
      {
        id: 'opt_s3_other',
        text: `${s3OtherSample.de} (${s3OtherSample.vi})`,
        subtext: `Chứa âm: ${s3Other?.letter || ''}`,
        isCorrect: false
      }
    ]),
    explanation: `Bạn vừa nghe từ "${s3Sample.de}". Lưu ý âm "${s3.letter}": ${s3.mouthTip}`
  });

  // Question 5: Voice Challenge for Sound 4
  const s4 = sounds[4] || sounds[0];
  const s4Sample = s4.examples?.[0] || { de: 'Apfel', vi: 'Quả táo', phonetic: 'Áp-fồ' };
  questions.push({
    id: `q5_daily5_${s4.id}`,
    type: 'voice_challenge',
    categoryTag: 'Âm tiêu điểm 5',
    title: `Thử thách đọc to: "${s4.letter}"`,
    instruction: `Hãy bấm loa nghe từ mẫu, sau đó nhấn micro để đọc to (hoặc tự đọc to):`,
    targetWord: s4Sample.de,
    targetLetter: s4.letter,
    audioText: s4Sample.de,
    audioLang: 'de',
    mouthTip: s4.mouthTip,
    options: [
      {
        id: 'voice_success',
        text: `Đọc to chuẩn xác: "${s4Sample.de}"`,
        isCorrect: true
      }
    ],
    explanation: `Mẹo phát âm từ "${s4Sample.de}" chứa âm "${s4.letter}": ${s4.mouthTip}`
  });

  return questions;
}
