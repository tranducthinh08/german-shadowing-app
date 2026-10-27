/**
 * PolyGlot Studio - German AI Speaking Coach Diagnostic Engine
 * 
 * Provides:
 * 1. Deep phonetic diagnostic for German speech (Umlaute, V vs W, Z affricates, CH rules, SP/ST).
 * 2. Word-by-word visual grading (Green / Yellow / Red) with actionable mouth posture guidance.
 * 3. Curated German pronunciation drills categorized by phonetic challenge.
 */

// Strip German punctuation
export function cleanGermanPunctuation(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '').trim();
}

// Check if word contains any German Umlaut or Eszett
export function hasUmlautOrEszett(word) {
  return /[äöüßÄÖÜẞ]/.test(word);
}

// Convert German umlauts to basic vowels for phonetic comparison
export function stripUmlauts(word) {
  return word
    .replace(/[äÄ]/g, 'a')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/ß/g, 'ss');
}

/**
 * Phonetic tips lookup for specific German sounds
 */
export const PHONETIC_RULES_TIPS = {
  umlaut_ae: {
    label: 'Âm Ä / ä',
    mouthTip: 'Mở rộng miệng khoảng giữa âm e và a (e bẹt /æ/). Đừng đọc lướt thành âm "a" thường.',
    sound: '[ɛː] / [ɛ]'
  },
  umlaut_oe: {
    label: 'Âm Ö / ö',
    mouthTip: 'Chu môi thật tròn xoe như chuẩn bị nói "Ô", nhưng giữ môi và phát ra âm "Ê".',
    sound: '[øː] / [œ]'
  },
  umlaut_ue: {
    label: 'Âm Ü / ü',
    mouthTip: 'Chu môi nhọn huýt sáo như nói "U", nhưng vị trí đầu lưỡi áp chân răng dưới nói "I".',
    sound: '[yː] / [ʏ]'
  },
  eszett: {
    label: 'Âm ß (Eszett)',
    mouthTip: 'Xì hơi âm "s" thật sắc nét và kéo dài sau nguyên âm dài hoặc nguyên âm đôi.',
    sound: '[s]'
  },
  v_as_f: {
    label: 'Chữ V đọc là F',
    mouthTip: 'Răng cửa trên chạm nhẹ môi dưới thổi luồng hơi ra (như Vater, vier, Vogel). Không đọc là V tiếng Việt!',
    sound: '[f]'
  },
  w_as_v: {
    label: 'Chữ W đọc là V',
    mouthTip: 'Răng trên chạm môi dưới và rung dây thanh âm (như Wasser, wie, wo). Không đọc thành quờ/wo tiếng Anh!',
    sound: '[v]'
  },
  z_affricate: {
    label: 'Chữ Z bật âm [ts]',
    mouthTip: 'Chặn đầu lưỡi sau răng cửa trên tạo âm t rồi lập tức bật xì sắc nét s [ts] (như Zeit, Zug). Tuyệt đối không đọc z mềm!',
    sound: '[ts]'
  },
  ch_ich: {
    label: 'CH sau e, i (Ich-Laut)',
    mouthTip: 'Áp nhẹ lưng lưỡi lên vòm họng cứng và xì luồng hơi êm như tiếng mèo khè (ich, nicht).',
    sound: '[ç]'
  },
  ch_ach: {
    label: 'CH sau a, o, u (Ach-Laut)',
    mouthTip: 'Nâng cuống lưỡi lên vòm họng mềm, đẩy hơi từ sâu cổ họng tạo âm khạc nhẹ (Buch, Nacht).',
    sound: '[x]'
  },
  sp_st_initial: {
    label: 'SP / ST đầu từ',
    mouthTip: 'Ở đầu từ, chữ S tự động chuyển thành âm "sh" chu môi [ʃp] và [ʃt] (như Sport, Stadt).',
    sound: '[ʃp] / [ʃt]'
  },
  ig_ending: {
    label: 'Đuôi -IG cuối từ',
    mouthTip: 'Trong tiếng Đức chuẩn, đuôi -ig ở cuối từ luôn đọc xì nhẹ là "ích" [ɪç] (như richtig, fertig).',
    sound: '[ɪç]'
  }
};

/**
 * Curated Practice Drills categorized by German phonetic hurdle
 */
export const GERMAN_SPEAKING_DRILLS = [
  {
    categoryId: 'umlaute',
    categoryTitle: 'Chinh phục Umlaute (Ä, Ö, Ü)',
    categoryIcon: '✨',
    badge: 'Umlaut Master',
    description: 'Rèn luyện khẩu hình môi tròn và huýt sáo đặc trưng của tiếng Đức.',
    sentences: [
      { id: 'u1', de: 'Wie schön ist dieser Tag!', vi: 'Ngày hôm nay mới đẹp làm sao!', focus: 'ö tròn môi nói ê' },
      { id: 'u2', de: 'Ich möchte fünf Äpfel kaufen.', vi: 'Tôi muốn mua năm quả táo.', focus: 'ö, ü, ä' },
      { id: 'u3', de: 'Er fährt über die grüne Brücke.', vi: 'Anh ấy đi qua cây cầu màu xanh lá.', focus: 'ä, ü chu môi huýt sáo' },
      { id: 'u4', de: 'Können Sie mir bitte helfen?', vi: 'Ngài có thể giúp tôi một chút được không?', focus: 'ö trong können' },
      { id: 'u5', de: 'Das Mädchen isst leckeren Käse.', vi: 'Cô bé ăn món phô mai thơm ngon.', focus: 'ä trong Mädchen, Käse' }
    ]
  },
  {
    categoryId: 'v_vs_w',
    categoryTitle: 'Phân biệt V (phát âm F) vs W (phát âm V)',
    categoryIcon: '⚡',
    badge: 'Cực dễ nhầm',
    description: 'Khắc phục triệt để lỗi số 1 của người học tiếng Đức: nhầm lẫn giữa V và W.',
    sentences: [
      { id: 'vw1', de: 'Mein Vater trinkt warmes Wasser.', vi: 'Bố tôi uống nước ấm.', focus: 'Vater [f] vs Wasser [v]' },
      { id: 'vw2', de: 'Wir haben vier weiße Vögel.', vi: 'Chúng tôi có bốn con chim màu trắng.', focus: 'Wir/weiße [v] vs vier/Vögel [f]' },
      { id: 'vw3', de: 'Wo wohnt deine Familie von vier Personen?', vi: 'Gia đình 4 người của bạn sống ở đâu?', focus: 'wo/wohnt [v] vs von/vier [f]' },
      { id: 'vw4', de: 'Vielleicht fahren wir wieder nach Wien.', vi: 'Có lẽ chúng tôi sẽ lại đi đến Viên.', focus: 'Vielleicht [f] vs wir/wieder/Wien [v]' }
    ]
  },
  {
    categoryId: 'z_affricate',
    categoryTitle: 'Bật âm Z [ts] sắc nét',
    categoryIcon: '🎯',
    badge: 'Bật âm TS',
    description: 'Chữ Z trong tiếng Đức luôn luôn bật âm [ts], tuyệt đối không đọc như z mềm.',
    sentences: [
      { id: 'z1', de: 'Wir haben zur Zeit zwei Zimmer frei.', vi: 'Hiện tại chúng tôi có hai phòng còn trống.', focus: 'zur Zeit zwei Zimmer [ts]' },
      { id: 'z2', de: 'Der Zug kommt genau um zehn Uhr.', vi: 'Chuyến tàu đến đúng lúc mười giờ.', focus: 'Zug, zehn [ts]' },
      { id: 'z3', de: 'Zusammen trinken wir eine Tasse Tee.', vi: 'Chúng ta cùng nhau uống một tách trà.', focus: 'zusammen [ts]' },
      { id: 'z4', de: 'Zweihundertzwanzig Euro kostet das.', vi: 'Cái đó có giá hai trăm hai mươi Euro.', focus: 'chuỗi âm [ts] liên tiếp' }
    ]
  },
  {
    categoryId: 'ch_clusters',
    categoryTitle: 'Cụm âm CH: Ich-Laut [ç] & Ach-Laut [x]',
    categoryIcon: '🐱',
    badge: 'Vị trí âm họng',
    description: 'Xì nhẹ ở vòm họng trước (ich) hoặc khạc nhẹ sâu cuống họng (Buch).',
    sentences: [
      { id: 'ch1', de: 'Ich suche ein gutes Buch.', vi: 'Tôi tìm kiếm một quyển sách hay.', focus: 'ich [ç] vs Buch [x]' },
      { id: 'ch2', de: 'Möchtest du Milch oder Kuchen?', vi: 'Bạn muốn sữa hay bánh ngọt?', focus: 'möchtest/Milch [ç] vs Kuchen [x]' },
      { id: 'ch3', de: 'Heute Nacht koche ich für dich.', vi: 'Tối nay tôi nấu ăn cho bạn.', focus: 'Nacht/koche [x] vs dich [ç]' },
      { id: 'ch4', de: 'Gute Nacht, bis morgen!', vi: 'Chúc ngủ ngon, hẹn gặp lại ngày mai!', focus: 'Nacht [x] cuống họng' }
    ]
  },
  {
    categoryId: 'daily_a1',
    categoryTitle: 'Giao tiếp Nicos Weg A1 Phản xạ',
    categoryIcon: '💬',
    badge: 'A1 Thực tế',
    description: 'Các câu giao tiếp căn bản hàng ngày cần ngữ điệu và phát âm chuẩn xác.',
    sentences: [
      { id: 'nw1', de: 'Hallo, ich bin Nico. Wie geht es dir?', vi: 'Xin chào, tôi là Nico. Bạn khỏe không?' },
      { id: 'nw2', de: 'Entschuldigung, wo ist der Bahnhof?', vi: 'Xin lỗi, nhà ga nằm ở đâu vậy?' },
      { id: 'nw3', de: 'Ich lerne Deutsch, weil ich in Deutschland leben möchte.', vi: 'Tôi học tiếng Đức vì tôi muốn sống tại Đức.' },
      { id: 'nw4', de: 'Ich habe meine Tasche verloren.', vi: 'Tôi đã bị thất lạc chiếc túi xách của mình.' }
    ]
  }
];

/**
 * Analyze speech phonetics comparing target vs spoken German text
 * 
 * @param {string} targetSentence 
 * @param {string} spokenSentence 
 * @returns {object} Diagnostic result
 */
export function analyzeSpeechPhonetics(targetSentence, spokenSentence) {
  if (!targetSentence) {
    return {
      score: 0,
      words: [],
      alerts: [],
      generalTip: 'Hãy chọn một câu để bắt đầu luyện phát âm.',
      grade: 'pending'
    };
  }

  const rawTargetWords = targetSentence.trim().split(/\s+/).filter(Boolean);
  const targetWords = rawTargetWords.map(w => cleanGermanPunctuation(w));
  const spokenClean = (spokenSentence || '').toLowerCase().trim();
  const spokenWords = spokenClean.split(/\s+/).map(w => cleanGermanPunctuation(w)).filter(Boolean);

  const wordEvaluations = [];
  const alerts = [];
  let totalScoreSum = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const origWord = rawTargetWords[i];
    const targetWord = targetWords[i];
    const targetLower = targetWord.toLowerCase();
    
    // Check if spoken text contains exact word
    const isExactMatch = spokenWords.includes(targetLower);

    // Check without Umlauts
    const targetNoUmlaut = stripUmlauts(targetLower);
    const isUmlautMissing = !isExactMatch && hasUmlautOrEszett(targetWord) && spokenWords.includes(targetNoUmlaut);

    // Check V vs W confusion
    const hasV = targetLower.includes('v');
    const hasW = targetLower.includes('w');
    const hasZ = targetLower.includes('z');
    const hasCH = targetLower.includes('ch');
    const hasSpSt = /^(sp|st)/.test(targetLower);
    const hasIgEnd = /ig$/.test(targetLower);

    let status = 'missed';
    let wordScore = 0;
    let feedback = '';
    let phoneticTip = null;

    if (isExactMatch) {
      status = 'correct';
      wordScore = 100;
      feedback = 'Phát âm chuẩn xác!';
    } else if (isUmlautMissing) {
      status = 'partial';
      wordScore = 75;
      feedback = 'Thiếu dấu Umlaut! Bạn đang phát âm nguyên âm thường thay vì nguyên âm biến đổi.';
      
      if (/[äÄ]/.test(targetWord)) {
        phoneticTip = PHONETIC_RULES_TIPS.umlaut_ae;
        alerts.push({ type: 'umlaut', word: targetWord, message: `Chữ "ä" trong "${targetWord}": mở rộng miệng e bẹt (/æ/).` });
      } else if (/[öÖ]/.test(targetWord)) {
        phoneticTip = PHONETIC_RULES_TIPS.umlaut_oe;
        alerts.push({ type: 'umlaut', word: targetWord, message: `Chữ "ö" trong "${targetWord}": chu tròn môi Ô nhưng nói Ê.` });
      } else if (/[üÜ]/.test(targetWord)) {
        phoneticTip = PHONETIC_RULES_TIPS.umlaut_ue;
        alerts.push({ type: 'umlaut', word: targetWord, message: `Chữ "ü" trong "${targetWord}": chu môi huýt sáo U nhưng nói I.` });
      } else if (/ß/.test(targetWord)) {
        phoneticTip = PHONETIC_RULES_TIPS.eszett;
        alerts.push({ type: 'eszett', word: targetWord, message: `Chữ "ß" trong "${targetWord}": xì âm s sắc nét kéo dài.` });
      }
    } else {
      // Find closest spoken word
      const bestSpoken = spokenWords[i] || spokenWords.find(sw => sw.length > 2 && (sw.includes(targetLower) || targetLower.includes(sw)));
      
      if (bestSpoken) {
        status = 'partial';
        wordScore = 60;
        feedback = `Nghe thấy gần giống: "${bestSpoken}".`;
      } else {
        status = 'missed';
        wordScore = 0;
        feedback = 'Chưa nhận diện được từ này hoặc bị nuốt âm.';
      }

      // Attach relevant phonetic rules for target word
      if (hasV) {
        phoneticTip = PHONETIC_RULES_TIPS.v_as_f;
        alerts.push({ type: 'v_f', word: targetWord, message: `Chữ V trong "${targetWord}": phát âm là F (răng trên chạm môi dưới).` });
      } else if (hasW) {
        phoneticTip = PHONETIC_RULES_TIPS.w_as_v;
        alerts.push({ type: 'w_v', word: targetWord, message: `Chữ W trong "${targetWord}": phát âm rung [v], không đọc quờ.` });
      } else if (hasZ) {
        phoneticTip = PHONETIC_RULES_TIPS.z_affricate;
        alerts.push({ type: 'z', word: targetWord, message: `Chữ Z trong "${targetWord}": bật âm [ts] dứt khoát.` });
      } else if (hasCH) {
        phoneticTip = targetLower.includes('ich') || targetLower.includes('ech') ? PHONETIC_RULES_TIPS.ch_ich : PHONETIC_RULES_TIPS.ch_ach;
      } else if (hasSpSt) {
        phoneticTip = PHONETIC_RULES_TIPS.sp_st_initial;
      } else if (hasIgEnd) {
        phoneticTip = PHONETIC_RULES_TIPS.ig_ending;
      }
    }

    totalScoreSum += wordScore;

    wordEvaluations.push({
      original: origWord,
      clean: targetWord,
      status,
      score: wordScore,
      feedback,
      phoneticTip
    });
  }

  const finalScore = targetWords.length > 0 ? Math.round(totalScoreSum / targetWords.length) : 0;

  let grade = 'try_again';
  let generalTip = '';

  if (finalScore >= 95) {
    grade = 'native_like';
    generalTip = '🎉 Xuất sắc! Ngữ điệu và phát âm của bạn chuẩn như người bản xứ!';
  } else if (finalScore >= 80) {
    grade = 'good';
    generalTip = '👏 Rất tốt! Bạn đã phát âm rõ ràng, chỉ cần chú ý thêm một vài âm vị tinh tế.';
  } else if (finalScore >= 60) {
    grade = 'needs_improvement';
    generalTip = '💡 Khá tốt! Hãy bấm vào các từ màu vàng để xem mẹo khẩu hình và luyện lại.';
  } else {
    grade = 'try_again';
    generalTip = '🎙️ Hãy nghe mẫu phát âm chậm và thử lại từng cụm từ ngắn nhé!';
  }

  // Deduplicate alerts by message
  const uniqueAlerts = [];
  const seenMessages = new Set();
  for (const alt of alerts) {
    if (!seenMessages.has(alt.message)) {
      seenMessages.add(alt.message);
      uniqueAlerts.push(alt);
    }
  }

  return {
    score: finalScore,
    spokenText: spokenSentence,
    words: wordEvaluations,
    alerts: uniqueAlerts,
    generalTip,
    grade
  };
}
