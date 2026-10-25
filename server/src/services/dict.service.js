import axios from 'axios';

/**
 * Clean word: strip surrounding punctuation and lowercase
 */
function cleanWord(rawWord) {
  if (!rawWord) return '';
  return rawWord.replace(/^[^a-zA-ZäöüßÄÖÜ]+|[^a-zA-ZäöüßÄÖÜ]+$/g, '');
}

/**
 * Translate foreign sentence to Vietnamese using free translation service
 */
export async function translateToVietnamese(text, fromLang = 'auto') {
  if (!text || !text.trim()) return '';
  try {
    const langParam = fromLang === 'de' ? 'de' : fromLang === 'en' ? 'en' : 'auto';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${langParam}&tl=vi&dt=t&q=${encodeURIComponent(text.trim())}`;
    const res = await axios.get(url, { timeout: 6000 });
    if (res.data && res.data[0]) {
      const translated = res.data[0].map(s => s[0]).join('');
      return translated.trim();
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
