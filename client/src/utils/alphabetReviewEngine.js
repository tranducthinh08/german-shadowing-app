/**
 * Alphabet Daily Review & Practice Engine
 * 
 * Generates tailored daily drills (listen & pick letter, minimal pairs contrast,
 * sound in context, and voice challenge) prioritizing starred and tricky sounds.
 */

import { GERMAN_ALPHABET, MINIMAL_PAIRS, getDifficultLetters, getAlphabetItemById } from '../data/germanAlphabetData.js';

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
  const today = new Date().toISOString().split('T')[0];
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
