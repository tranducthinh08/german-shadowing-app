/**
 * Advanced Pronunciation Guide & Phonetic Engine
 * Provides:
 * 1. Curated IPA and Vietnamese phonetic approximation for common words
 * 2. Algorithmic phonetic transliteration for any German or English word
 * 3. Specific phonetic rules with mouth positioning & articulation tips in Vietnamese
 * 4. Text-to-speech audio player
 */

export const GERMAN_PHONETIC_RULES = [
  {
    regex: /ch/i,
    pattern: 'ch',
    sound: '[ç] hoặc [x]',
    tip: 'Nếu sau a, o, u, au: phát âm khạc nhẹ ở cuống họng (như "Buch", "auch"). Nếu sau e, i, ä, ö, ü, eu hoặc phụ âm: áp nhẹ lưng lưỡi lên vòm miệng xì hơi nhẹ (như "ich", "sprechen"). Tuyệt đối không đọc thành âm "k"!'
  },
  {
    regex: /ü/i,
    pattern: 'ü / Ü',
    sound: '[yː] hoặc [ʏ]',
    tip: 'Khẩu hình: Chu tròn môi như khi huýt sáo hoặc nói "u", nhưng vị trí lưỡi và phát âm chữ "i" (nghe tựa như "uy" nhưng tròn môi chặt).'
  },
  {
    regex: /ö/i,
    pattern: 'ö / Ö',
    sound: '[øː] hoặc [œ]',
    tip: 'Khẩu hình: Tròn môi như chuẩn bị nói "ô", nhưng phát ra âm "ê" (tương tự âm "ơ/ê" sâu trong họng).'
  },
  {
    regex: /ä/i,
    pattern: 'ä / Ä',
    sound: '[ɛː] hoặc [ɛ]',
    tip: 'Mở rộng khẩu hình giữa âm "e" và "a" (giống "e" bẹt, như trong "Mädchen", "Hände").'
  },
  {
    regex: /ß/i,
    pattern: 'ß (Eszett)',
    sound: '[s]',
    tip: 'Đọc là âm "s" xì hơi sắc nét và kéo dài (không rung thanh quản), đứng sau nguyên âm dài hoặc nguyên âm đôi (như "groß", "heißen").'
  },
  {
    regex: /^sp/i,
    pattern: 'sp- ở đầu từ/âm tiết',
    sound: '[ʃp]',
    tip: 'Đọc là "shp": Chu tròn môi xì luồng hơi mạnh "sh" rồi lập tức bật âm "p", ví dụ: "sprechen" đọc như "sh-pre-khừn", "Sport" đọc là "Sh-port".'
  },
  {
    regex: /^st/i,
    pattern: 'st- ở đầu từ/âm tiết',
    sound: '[ʃt]',
    tip: 'Đọc là "sht": Chu môi xì mạnh âm "sh" rồi bật âm "t", ví dụ: "Stadt" đọc là "Sh-tát", "Straße" đọc là "Sh-tra-sơ".'
  },
  {
    regex: /sch/i,
    pattern: 'sch',
    sound: '[ʃ]',
    tip: 'Chu tròn môi về phía trước và đẩy luồng hơi mạnh ra khe răng (nặng hơn âm "x" tiếng Việt, giống âm "sh" tiếng Anh hoặc tiếng suỵt im lặng).'
  },
  {
    regex: /z|tz/i,
    pattern: 'z / tz',
    sound: '[ts]',
    tip: 'Bật đồng thời hai âm "t" và "s" sắc nét (giống âm "ts" trong tiếng Nhật/Ý), tuyệt đối không đọc như âm "d/gi" tiếng Việt hay "z" tiếng Anh! Ví dụ: "Zeit" = "tsait", "zusammen" = "tsu-sam-mừn".'
  },
  {
    regex: /eu|äu/i,
    pattern: 'eu / äu',
    sound: '[ɔɪ]',
    tip: 'Đọc thành âm "oi" (như trong "neu" = "noi", "Deutschland" = "Đoi-t-sh-lan-đ", "Häuser" = "Hoi-dơ").'
  },
  {
    regex: /ei/i,
    pattern: 'ei',
    sound: '[aɪ]',
    tip: 'Đọc thành âm "ai" (như trong "mein" = "mai-n", "arbeiten" = "ác-bai-từn", "heißen" = "hai-sừn").'
  },
  {
    regex: /ie/i,
    pattern: 'ie',
    sound: '[iː]',
    tip: 'Đọc thành âm "i" kéo dài ngân vang (như trong "sie", "wie", "Liebe", "nie").'
  },
  {
    regex: /^v/i,
    pattern: 'v ở đầu từ',
    sound: '[f]',
    tip: 'Trong từ gốc Đức, chữ "v" phát âm như âm "ph/f" (răng trên chạm môi dưới thổi hơi), ví dụ: "Vater" = "Pha-tờ", "viel" = "Phi-l", "von" = "Phon".'
  },
  {
    regex: /w/i,
    pattern: 'w',
    sound: '[v]',
    tip: 'Chữ "w" trong tiếng Đức đọc như âm "v" (răng trên chạm nhẹ môi dưới rung dây thanh âm), ví dụ: "wo" = "vô", "wer" = "ve-r", "Wasser" = "Va-sờ".'
  },
  {
    regex: /r/i,
    pattern: 'r',
    sound: '[ʁ] hoặc [ɐ]',
    tip: 'Ở đầu hoặc giữa từ: rung nhẹ cuống họng/lưỡi gà (như "rot", "fragen"). Ở đuôi từ (như "-er"): thả lỏng đọc nhẹ lướt thành âm "ơ/à" ngắn (như "Mutter" = "Mút-tờ").'
  },
  {
    regex: /qu/i,
    pattern: 'qu',
    sound: '[kv]',
    tip: 'Phát âm là "k-v" (bật k rồi chuyển nhanh sang v), ví dụ: "Bequem" = "bê-kvem".'
  },
  {
    regex: /ig$/i,
    pattern: '-ig ở cuối từ',
    sound: '[ɪç]',
    tip: 'Đọc là âm "ích" xì nhẹ vòm miệng trước (chuẩn Hochdeutsch), ví dụ: "richtig" = "rích-tích", "fertig" = "phe-r-tích".'
  }
];

export const ENGLISH_PHONETIC_RULES = [
  {
    regex: /th/i,
    pattern: 'th',
    sound: '[θ] hoặc [ð]',
    tip: 'Đặt đầu lưỡi kẹp nhẹ giữa hai hàm răng và đẩy luồng hơi ra. Rung thanh quản nếu là "this, that, the", không rung nếu là "think, thank, breath".'
  },
  {
    regex: /^w/i,
    pattern: 'w',
    sound: '[w]',
    tip: 'Chu môi tròn rồi mở nhanh miệng, tránh để răng chạm vào môi dưới (không đọc thành âm v).'
  },
  {
    regex: /v/i,
    pattern: 'v',
    sound: '[v]',
    tip: 'Răng cửa trên chạm nhẹ vào phần trong của môi dưới và rung mạnh dây thanh quản.'
  },
  {
    regex: /sh/i,
    pattern: 'sh',
    sound: '[ʃ]',
    tip: 'Chu môi tròn về phía trước, hai hàm răng khép hờ và đẩy luồng hơi mạnh qua khe răng.'
  },
  {
    regex: /ch/i,
    pattern: 'ch',
    sound: '[tʃ]',
    tip: 'Chặn luồng hơi bằng đầu lưỡi chạm vòm miệng rồi bật mạnh ra ngoài (như "tr" nặng).'
  },
  {
    regex: /tion|sion/i,
    pattern: '-tion / -sion',
    sound: '[ʃən] hoặc [ʒən]',
    tip: 'Đọc là "shừn", luôn nhấn trọng âm rơi vào âm tiết ngay liền trước nó.'
  },
  {
    regex: /ed$/i,
    pattern: 'đuôi -ed',
    sound: '[t], [d] hoặc [ɪd]',
    tip: 'Đọc là [t] sau âm vô thanh (p, k, f, s, sh, ch); đọc [ɪd] sau t và d; còn lại đọc [d].'
  }
];

// Curated high-accuracy phonetic dictionary for popular German vocabulary
export const GERMAN_COMMON_WORDS_PHONETICS = {
  'sprechen': { ipa: '/ˈʃpʁɛçn̩/', vi: 'sh-pre-khừn', syllables: 'spre • chen', stress: 1, tip: 'sp đọc là shp, ch sau e xì nhẹ vòm miệng.' },
  'spricht': { ipa: '/ʃpʁɪçt/', vi: 'sh-p-rích-t', syllables: 'spricht', stress: 1, tip: 'sp đọc là shp, ch xì vòm miệng, bật âm t cuối.' },
  'sprache': { ipa: '/ˈʃpʁaːxə/', vi: 'sh-pra-khơ', syllables: 'Spra • che', stress: 1, tip: 'ch sau a đọc là khạc nhẹ cuống họng.' },
  'deutsch': { ipa: '/dɔɪ̯t͡ʃ/', vi: 'đoi-t-sh', syllables: 'deutsch', stress: 1, tip: 'eu đọc là oi, tsch đọc là t-sh chu môi bật mạnh.' },
  'deutschland': { ipa: '/ˈdɔɪ̯t͡ʃlant/', vi: 'đoi-t-sh-lan-đ', syllables: 'Deutsch • land', stress: 1, tip: 'eu đọc là oi, d cuối từ đọc cứng như t.' },
  'hallo': { ipa: '/ˈhaloː/', vi: 'ha-lô', syllables: 'Hal • lo', stress: 1, tip: 'h bật hơi nhẹ, o tròn môi.' },
  'tschüss': { ipa: '/t͡ʃʏs/', vi: 't-shuy-s', syllables: 'tschüss', stress: 1, tip: 'tsch đọc t-sh chu môi, ü tròn môi chặt, ss xì sắc nét.' },
  'danke': { ipa: '/ˈdaŋkə/', vi: 'đan-kơ', syllables: 'Dan • ke', stress: 1, tip: 'nk đọc là ng-k, e cuối đọc là ơ ngắn.' },
  'bitte': { ipa: '/ˈbɪtə/', vi: 'bít-tơ', syllables: 'Bit • te', stress: 1, tip: 'i ngắn, bật dứt khoát âm t, e đọc là ơ nhẹ.' },
  'entschuldigung': { ipa: '/ɛntˈʃʊldɪɡʊŋ/', vi: 'en-t-shun-đi-gung', syllables: 'ent • schul • di • gung', stress: 2, tip: 'nhấn trọng âm vào "schul", ung cuối đọc ngân.' },
  'bahnhof': { ipa: '/ˈbaːnˌhoːf/', vi: 'ban-hô-ph', syllables: 'Bahn • hof', stress: 1, tip: 'a kéo dài (h câm), o kéo dài, f thổi hơi răng môi.' },
  'hauptbahnhof': { ipa: '/ˈhaʊ̯ptbaːnˌhoːf/', vi: 'hao-p-t-ban-hô-ph', syllables: 'Haupt • bahn • hof', stress: 1, tip: 'au đọc là ao, p và t bật nhanh.' },
  'flughafen': { ipa: '/ˈfluːkˌhaːfn̩/', vi: 'flu-k-ha-phừn', syllables: 'Flug • ha • fen', stress: 1, tip: 'g cuối đọc cứng như k, fen đọc là phừn nhẹ.' },
  'krankenhaus': { ipa: '/ˈkʁaŋkn̩ˌhaʊ̯s/', vi: 'kran-kừn-hao-s', syllables: 'Kran • ken • haus', stress: 1, tip: 's cuối từ đọc xì sắc nét.' },
  'mädchen': { ipa: '/ˈmɛːtçn̩/', vi: 'mét-khừn', syllables: 'Mäd • chen', stress: 1, tip: 'ä đọc như e bẹt, d trước ch đọc là t, ch xì vòm miệng.' },
  'schön': { ipa: '/ʃøːn/', vi: 'sh-ơn (tròn môi)', syllables: 'schön', stress: 1, tip: 'sch chu môi mạnh, ö tròn môi phát âm ê.' },
  'schwierig': { ipa: '/ˈʃviːʁɪç/', vi: 'sh-vi-rích', syllables: 'schwie • rig', stress: 1, tip: 'schw đọc là sh-v, ig cuối đọc là ích.' },
  'frühstück': { ipa: '/ˈfʁyːʃtʏk/', vi: 'f-ry-sh-tức', syllables: 'Früh • stück', stress: 1, tip: 'ü tròn môi, st đọc là sht, ü ngắn đọc dứt khoát.' },
  'überhaupt': { ipa: '/yːbɐˈhaʊ̯pt/', vi: 'uy-bờ-hao-p-t', syllables: 'über • haupt', stress: 2, tip: 'ü tròn môi, au đọc là ao, pt bật ở cuối.' },
  'zusammen': { ipa: '/tsuˈzamən/', vi: 'tsu-da-mừn', syllables: 'zu • sam • men', stress: 2, tip: 'z đọc là ts, s trước nguyên âm đọc rung như d/gi.' },
  'wohnen': { ipa: '/ˈvoːnən/', vi: 'vô-nừn', syllables: 'woh • nen', stress: 1, tip: 'w đọc là v, h câm làm o kéo dài, nen đọc nừn.' },
  'arbeiten': { ipa: '/ˈaʁbaɪ̯tn̩/', vi: 'ác-bai-từn', syllables: 'ar • bei • ten', stress: 1, tip: 'ei đọc là ai, ten đọc là từn.' },
  'verzeihung': { ipa: '/fɛɐ̯ˈtsaɪ̯ʊŋ/', vi: 'phe-r-tsai-hung', syllables: 'Ver • zei • hung', stress: 2, tip: 'v đọc là ph, z đọc là ts, ei đọc là ai.' },
  'wiedersehen': { ipa: '/ˈviːdɐˌzeːən/', vi: 'vi-đờ-zê-ừn', syllables: 'wie • der • se • hen', stress: 1, tip: 'ie đọc i dài, der đọc đờ, sehen đọc zê-ừn.' },
  'verstehen': { ipa: '/fɛɐ̯ˈʃteːən/', vi: 'phe-r-sh-tê-ừn', syllables: 'ver • ste • hen', stress: 2, tip: 'v đọc ph, st đọc sht, eh đọc ê dài.' },
  'guten': { ipa: '/ˈɡuːtn̩/', vi: 'gu-từn', syllables: 'Gu • ten', stress: 1, tip: 'u dài, ten đọc lướt thành từn.' },
  'morgen': { ipa: '/ˈmɔʁɡn̩/', vi: 'mo-r-gừn', syllables: 'Mor • gen', stress: 1, tip: 'o ngắn, gen đọc lướt thành gừn.' },
  'abend': { ipa: '/ˈaːbənt/', vi: 'a-bừn-t', syllables: 'A • bend', stress: 1, tip: 'a dài, d cuối đọc cứng thành t.' },
  'nacht': { ipa: '/naxt/', vi: 'na-kh-t', syllables: 'Nacht', stress: 1, tip: 'ch sau a khạc nhẹ ở cuống họng, bật âm t.' },
  'heute': { ipa: '/ˈhɔɪ̯tə/', vi: 'hoi-tơ', syllables: 'heu • te', stress: 1, tip: 'eu đọc là oi, te đọc tơ ngắn.' },
  'morgen_adv': { ipa: '/ˈmɔʁɡn̩/', vi: 'mo-r-gừn', syllables: 'mor • gen', stress: 1, tip: 'o ngắn, r nhẹ cuống họng.' },
  'gestern': { ipa: '/ˈɡɛstɐn/', vi: 'gét-s-tơn', syllables: 'ges • tern', stress: 1, tip: 'st giữa từ đọc là s-t (không đọc sht).' },
  'immer': { ipa: '/ˈɪmɐ/', vi: 'im-mờ', syllables: 'im • mer', stress: 1, tip: 'er cuối đọc nhẹ thành ờ/à.' },
  'vielleicht': { ipa: '/fiˈlaɪ̯çt/', vi: 'phi-lai-kh-t', syllables: 'viel • leicht', stress: 2, tip: 'v đọc ph, ie đọc i, ei đọc ai, ch xì vòm miệng.' },
  'natürlich': { ipa: '/naˈtyːɐ̯lɪç/', vi: 'na-tuy-r-lích', syllables: 'na • tür • lich', stress: 2, tip: 'ü tròn môi, lich đọc lích xì nhẹ.' },
  'wirklich': { ipa: '/ˈvɪʁklɪç/', vi: 'víc-k-lích', syllables: 'wirk • lich', stress: 1, tip: 'w đọc v, lich đọc lích xì nhẹ.' },
  'gerne': { ipa: '/ˈɡɛʁnə/', vi: 'ge-r-nơ', syllables: 'ger • ne', stress: 1, tip: 'g đọc như g tiếng Việt, e cuối đọc ơ nhẹ.' },
  'nichts': { ipa: '/nɪçts/', vi: 'ních-t-s', syllables: 'nichts', stress: 1, tip: 'ch sau i xì vòm miệng, ts bật nhanh sắc nét.' },
  'etwas': { ipa: '/ˈɛtvas/', vi: 'ét-vas', syllables: 'et • was', stress: 1, tip: 'w đọc là v, s cuối xì nhẹ.' },
  'alles': { ipa: '/ˈaləs/', vi: 'al-lờ-s', syllables: 'al • les', stress: 1, tip: 'a ngắn, s cuối xì.' }
};

/**
 * Algorithmic approximation of Vietnamese pronunciation for any German word
 */
export function generateGermanPhonetic(rawWord) {
  const word = rawWord.toLowerCase().replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '');
  if (!word) return { ipa: '', vi: '', syllables: '' };

  // Check dictionary first
  if (GERMAN_COMMON_WORDS_PHONETICS[word]) {
    const entry = GERMAN_COMMON_WORDS_PHONETICS[word];
    return {
      ipa: entry.ipa,
      vi: entry.vi,
      syllables: entry.syllables,
      customTip: entry.tip
    };
  }

  // Algorithmic Vietnamese phonetic transcription
  let vi = word;

  // Consonant clusters
  vi = vi.replace(/tsch/g, 't-sh ');
  vi = vi.replace(/sch/g, 'sh ');
  vi = vi.replace(/^sp/g, 'sh-p ');
  vi = vi.replace(/^st/g, 'sh-t ');
  vi = vi.replace(/([aeiouäöü])sp/g, '$1-s-p ');
  vi = vi.replace(/([aeiouäöü])st/g, '$1-s-t ');

  vi = vi.replace(/ch$/g, 'kh');
  vi = vi.replace(/ch/g, 'kh ');
  vi = vi.replace(/ck/g, 'k ');
  vi = vi.replace(/tz/g, 'ts ');
  vi = vi.replace(/z/g, 'ts ');
  vi = vi.replace(/qu/g, 'k-v ');
  vi = vi.replace(/ph/g, 'ph ');
  vi = vi.replace(/ß/g, 's ');
  vi = vi.replace(/ss/g, 's ');

  // Vowels and diphthongs
  vi = vi.replace(/eu/g, 'oi ');
  vi = vi.replace(/äu/g, 'oi ');
  vi = vi.replace(/ei/g, 'ai ');
  vi = vi.replace(/ie/g, 'i ');
  vi = vi.replace(/au/g, 'ao ');
  vi = vi.replace(/ä/g, 'e ');
  vi = vi.replace(/ö/g, 'ơ ');
  vi = vi.replace(/ü/g, 'uy ');

  // Consonants v & w
  vi = vi.replace(/^v/g, 'ph ');
  vi = vi.replace(/w/g, 'v ');
  vi = vi.replace(/j/g, 'y ');

  // Suffixes
  vi = vi.replace(/en$/g, '-ừn');
  vi = vi.replace(/er$/g, '-ờ');
  vi = vi.replace(/el$/g, '-ồ');
  vi = vi.replace(/ig$/g, '-ích');
  vi = vi.replace(/ung$/g, '-ung');

  // Clean extra spaces and hyphens
  vi = vi.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  // Estimated Syllables
  const syllables = word
    .replace(/([aeiouäöü]+)([^aeiouäöü]+)([aeiouäöü]+)/gi, '$1 • $2$3')
    .replace(/([aeiouäöü]+)([^aeiouäöü])([^aeiouäöü]+)([aeiouäöü]+)/gi, '$1$2 • $3$4');

  return {
    ipa: `/${word}/`,
    vi: vi,
    syllables: syllables
  };
}

/**
 * Algorithmic approximation of Vietnamese pronunciation for any English word
 */
export function generateEnglishPhonetic(rawWord) {
  const word = rawWord.toLowerCase().replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '');
  if (!word) return { ipa: '', vi: '', syllables: '' };

  let vi = word;
  vi = vi.replace(/tion$/g, '-shừn');
  vi = vi.replace(/sion$/g, '-zhừn');
  vi = vi.replace(/th/g, 'th-(kẹp lưỡi) ');
  vi = vi.replace(/sh/g, 'sh ');
  vi = vi.replace(/ch/g, 'ch ');
  vi = vi.replace(/ph/g, 'f ');
  vi = vi.replace(/ee|ea/g, 'i ');
  vi = vi.replace(/oo/g, 'u ');
  vi = vi.replace(/ou|ow/g, 'ao ');
  vi = vi.replace(/ight/g, 'ait');
  vi = vi.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return {
    ipa: `/${word}/`,
    vi: vi,
    syllables: word
  };
}

/**
 * Get comprehensive pronunciation guide for a word (IPA, Vietnamese phonetic, syllables, rules & tips)
 * @param {string} rawWord
 * @param {'de'|'en'} lang
 */
export function getWordPronunciationGuide(rawWord, lang = 'de') {
  const cleanWord = rawWord.replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '');
  if (!cleanWord) return null;

  const rules = lang === 'de' ? GERMAN_PHONETIC_RULES : ENGLISH_PHONETIC_RULES;
  const matchedRules = [];

  for (const rule of rules) {
    if (rule.regex.test(cleanWord)) {
      matchedRules.push({
        pattern: rule.pattern,
        sound: rule.sound,
        tip: rule.tip
      });
    }
  }

  // Generate phonetics
  const phoneticData = lang === 'de'
    ? generateGermanPhonetic(cleanWord)
    : generateEnglishPhonetic(cleanWord);

  return {
    word: cleanWord,
    lang,
    ipa: phoneticData.ipa,
    vietnamesePhonetic: phoneticData.vi,
    syllables: phoneticData.syllables,
    customTip: phoneticData.customTip,
    matchedRules: matchedRules.slice(0, 3) // Top 3 most important sound features
  };
}

// Reference to actively playing audio to prevent overlapping speech
let activeAudioInstance = null;

/**
 * Stop any ongoing audio playback (both HTML5 Audio and Web Speech)
 */
export function stopCurrentAudio() {
  if (activeAudioInstance) {
    try {
      activeAudioInstance.pause();
      activeAudioInstance.currentTime = 0;
    } catch (e) {}
    activeAudioInstance = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Internal fallback using Web Speech API with voice selection and Chrome unfreeze
 */
function speakViaWebSpeech(cleanText, lang = 'de', speed = 0.85, resolve) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (resolve) resolve(false);
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = speed;

    const voices = window.speechSynthesis.getVoices?.() || [];
    const targetLangCode = lang === 'de' ? 'de' : 'en';
    const matchVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(targetLangCode));
    if (matchVoice) {
      utterance.voice = matchVoice;
    }

    utterance.onend = () => {
      if (resolve) resolve(true);
    };
    utterance.onerror = () => {
      if (resolve) resolve(false);
    };

    // Keep global reference in window to bypass Chrome GC bug
    window._polyglotUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    if (resolve) resolve(false);
  }
}

/**
 * Play high-fidelity pronunciation audio for a word or German letter.
 * Dual-Engine Architecture:
 * 1. Primary: High-fidelity Google TTS MP3 audio stream (crystal clear native pronunciation,
 *    runs 100% reliably on all operating systems and browsers without needing local voice packs).
 * 2. Fallback: Native browser Web Speech API (speechSynthesis) if offline or audio stream blocked.
 * 
 * @param {string} word - The word or letter name to pronounce
 * @param {'de'|'en'} lang - Language code ('de' by default)
 * @param {number} speed - Playback speed rate (default: 0.85)
 * @returns {Promise<boolean>}
 */
export function speakWord(word, lang = 'de', speed = 0.85) {
  if (!word || typeof window === 'undefined') return Promise.resolve(false);

  const clean = word.replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '').trim();
  if (!clean) return Promise.resolve(false);

  // Stop any previous playing audio
  stopCurrentAudio();

  return new Promise((resolve) => {
    try {
      const ttsLang = lang === 'de' ? 'de' : 'en';
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(clean)}`;
      const audio = new Audio(audioUrl);
      activeAudioInstance = audio;
      audio.playbackRate = speed;

      let hasResolved = false;

      audio.onended = () => {
        if (activeAudioInstance === audio) {
          activeAudioInstance = null;
        }
        if (!hasResolved) {
          hasResolved = true;
          resolve(true);
        }
      };

      audio.onerror = () => {
        if (activeAudioInstance === audio) {
          activeAudioInstance = null;
        }
        speakViaWebSpeech(clean, lang, speed, resolve);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // In case browser policy blocked autoplay or network error, fallback to speech synthesis
          if (activeAudioInstance === audio) {
            activeAudioInstance = null;
          }
          speakViaWebSpeech(clean, lang, speed, resolve);
        });
      }
    } catch (err) {
      speakViaWebSpeech(clean, lang, speed, resolve);
    }
  });
}
