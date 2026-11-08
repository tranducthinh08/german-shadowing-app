import axios from 'axios';

/**
 * Clean word: strip surrounding punctuation and lowercase
 */
function cleanWord(rawWord) {
  if (!rawWord) return '';
  return rawWord.replace(/^[^a-zA-ZäöüßÄÖÜ]+|[^a-zA-ZäöüßÄÖÜ]+$/g, '');
}

/**
 * Translate foreign sentence to Vietnamese using multi-tier fallback service
 */
export async function translateToVietnamese(text, fromLang = 'auto') {
  if (!text || !text.trim()) return '';
  const langParam = fromLang === 'de' ? 'de' : fromLang === 'en' ? 'en' : 'auto';
  const cleanQ = text.trim();

  // Tier 1: Google dict-chrome-ex (high reliability, low latency, no rate-limit)
  try {
    const url1 = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${langParam}&tl=vi&q=${encodeURIComponent(cleanQ)}`;
    const res1 = await axios.get(url1, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0' },
      timeout: 4000
    });
    if (res1.data && typeof res1.data[0] === 'string' && res1.data[0].trim()) {
      return res1.data[0].trim();
    }
  } catch (e) {}

  // Tier 2: MyMemory API
  try {
    const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanQ)}&langpair=${langParam}|vi`;
    const res2 = await axios.get(url2, { timeout: 4000 });
    const match = res2.data?.responseData?.translatedText;
    if (match && typeof match === 'string' && match.trim() && !match.includes('MYMEMORY WARNING')) {
      return match.trim();
    }
  } catch (e) {}

  // Tier 3: Google gtx fallback with User-Agent
  try {
    const url3 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${langParam}&tl=vi&dt=t&q=${encodeURIComponent(cleanQ)}`;
    const res3 = await axios.get(url3, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0.0.0' },
      timeout: 4000
    });
    if (res3.data && res3.data[0]) {
      return res3.data[0].map(s => s[0]).join('').trim();
    }
  } catch (err) {
    console.warn('Translate to VI failed:', err.message);
  }

  return '';
}

/**
 * Lookup definition and phonetic transcription for a word
 */
export async function lookupWord(rawWord, lang = 'de') {
  const word = cleanWord(rawWord);
  if (!word) {
    throw new Error('Từ cần tra không hợp lệ');
  }

  const result = {
    word,
    lang,
    phonetic: '',
    meanings: [],
    audioUrl: null,
    dictionaryUrls: {
      leo: `https://dict.leo.org/${lang === 'de' ? 'german-english' : 'english-german'}/${encodeURIComponent(word)}`,
      duden: `https://www.duden.de/suchen/dudenonline/${encodeURIComponent(word)}`,
      cambridge: `https://dictionary.cambridge.org/dictionary/${lang === 'de' ? 'german-english' : 'english'}/${encodeURIComponent(word)}`,
      wiktionary: `https://${lang}.wiktionary.org/wiki/${encodeURIComponent(word)}`
    }
  };

  if (lang === 'en') {
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
        timeout: 4000
      });
      const data = res.data?.[0];
      if (data) {
        result.phonetic = data.phonetic || data.phonetics?.find(p => p.text)?.text || '';
        result.audioUrl = data.phonetics?.find(p => p.audio)?.audio || null;
        result.meanings = (data.meanings || []).slice(0, 3).map(m => ({
          partOfSpeech: m.partOfSpeech,
          definitions: (m.definitions || []).slice(0, 2).map(d => ({
            definition: d.definition,
            example: d.example || null
          }))
        }));
      }
    } catch (err) {
      // API lookup error or word not found, continue with fallbacks
    }
  } else if (lang === 'de') {
    // Basic German noun gender detection
    const isCapitalized = /^[A-ZÄÖÜ]/.test(word);
    let potentialGender = null;
    if (isCapitalized) {
      if (word.endsWith('ung') || word.endsWith('heit') || word.endsWith('keit') || word.endsWith('schaft') || word.endsWith('tion')) {
        potentialGender = 'die (feminin)';
      } else if (word.endsWith('chen') || word.endsWith('lein') || word.endsWith('ment') || word.endsWith('um')) {
        potentialGender = 'das (neutral)';
      } else if (word.endsWith('er') || word.endsWith('ling') || word.endsWith('or') || word.endsWith('ismus')) {
        potentialGender = 'der (maskulin)';
      }
    }

    if (potentialGender) {
      result.meanings.push({
        partOfSpeech: 'Substantiv (Noun)',
        definitions: [{
          definition: `Gợi ý giống: ${potentialGender}`,
          example: null
        }]
      });
    }

    // Try Wiktionary API for German
    try {
      const wikiRes = await axios.get(`https://de.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`, {
        timeout: 4000
      });
      if (wikiRes.data && wikiRes.data.de) {
        const entries = wikiRes.data.de;
        const definitions = [];
        entries.forEach(entry => {
          (entry.definitions || []).forEach(d => {
            const defClean = d.definition ? d.definition.replace(/<[^>]+>/g, '').trim() : '';
            if (defClean && definitions.length < 3) {
              definitions.push({
                partOfSpeech: entry.partOfSpeech || 'Wort',
                definition: defClean,
                example: d.examples?.[0]?.replace(/<[^>]+>/g, '') || null
              });
            }
          });
        });

        if (definitions.length > 0) {
          result.meanings = definitions;
        }
      }
    } catch (e) {
      // Ignore Wiktionary failure
    }
  }

  // If no definitions found via API, provide a helpful fallback
  if (result.meanings.length === 0) {
    result.meanings.push({
      partOfSpeech: lang === 'de' ? 'Từ vựng tiếng Đức' : 'English Word',
      definitions: [{
        definition: `Tra cứu chi tiết từ "${word}" trên từ điển LEO hoặc Duden qua liên kết bên dưới.`,
        example: null
      }]
    });
  }

  return result;
}
