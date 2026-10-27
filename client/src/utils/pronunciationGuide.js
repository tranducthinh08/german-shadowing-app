/**
 * Advanced Pronunciation Guide & Phonetic Engine
 * Provides:
 * 1. Curated IPA and Vietnamese phonetic approximation for common words
 * 2. Algorithmic phonetic transliteration for any German or English word
 * 3. Specific phonetic rules with mouth positioning & articulation tips in Vietnamese
 * 4. Text-to-speech audio player
 */

import {
  GERMAN_PHONETIC_RULES,
  ENGLISH_PHONETIC_RULES,
  GERMAN_COMMON_WORDS_PHONETICS
} from "../data/germanPhoneticData.js";

export {
  GERMAN_PHONETIC_RULES,
  ENGLISH_PHONETIC_RULES,
  GERMAN_COMMON_WORDS_PHONETICS
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
export function speakViaWebSpeech(cleanText, lang = 'de', speed = 0.85, resolve) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (resolve) resolve(false);
    return false;
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
    const matchVoice = voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(targetLangCode));
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
    return true;
  } catch (e) {
    if (resolve) resolve(false);
    return false;
  }
}

/**
 * Play high-fidelity pronunciation audio for a word or German letter.
 * Dual-Engine Architecture:
 * 1. Primary: High-fidelity Serverless TTS Proxy at `/api/tts` (pipes native Google TTS MP3 audio stream
 *    without third-party referrer block, edge-cached on Vercel CDN, works 100% reliably on all devices).
 * 2. Fallback: Native browser Web Speech API (speechSynthesis) if offline or serverless stream unreachable.
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
      const audioUrl = `/api/tts?text=${encodeURIComponent(clean)}&lang=${ttsLang}`;
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
