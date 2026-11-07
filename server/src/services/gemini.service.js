import axios from 'axios';
import { translateToVietnamese } from './dict.service.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Resolves active Gemini API key from custom header or server environment
 */
export function getActiveGeminiKey(customKey) {
  if (customKey && typeof customKey === 'string' && customKey.trim().length > 10) {
    return customKey.trim();
  }
  return process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
}

/**
 * Cleans potential markdown code blocks from Gemini response
 */
function cleanJsonOutput(rawText) {
  if (!rawText) return '{}';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Translates and analyzes a sentence using Google Gemini 1.5 Flash
 * Falls back gracefully to free Google Translate if Gemini fails or lacks API Key
 *
 * @param {string} text - Sentence in German or English
 * @param {string} sourceLang - 'de' | 'en' | 'auto'
 * @param {string} [customApiKey] - Optional user-provided API key
 * @returns {Promise<{
 *   translation: string,
 *   literal: string,
 *   terms: Array<{ term: string, meaning: string }>,
 *   grammarTip: string,
 *   provider: 'gemini' | 'fallback'
 * }>}
 */
export async function translateSentenceWithGemini(text, sourceLang = 'de', customApiKey = '') {
  if (!text || !text.trim()) {
    return {
      translation: '',
      literal: '',
      terms: [],
      grammarTip: '',
      provider: 'fallback'
    };
  }

  const cleanText = text.trim();
  const apiKey = getActiveGeminiKey(customApiKey);

  // If no Gemini API key configured, use free translation fallback immediately
  if (!apiKey) {
    const fallbackTranslation = await translateToVietnamese(cleanText, sourceLang);
    return {
      translation: fallbackTranslation,
      literal: '',
      terms: [],
      grammarTip: '',
      provider: 'fallback'
    };
  }

  const langName = sourceLang === 'en' ? 'tiếng Anh' : 'tiếng Đức';

  const systemInstruction = `Bạn là trợ lý dịch thuật và ngôn ngữ học chuyên sâu cho ứng dụng PolyGlot Studio.
Nhiệm vụ: Dịch câu ${langName} sau sang tiếng Việt tự nhiên và phân tích nhanh ngữ nghĩa cho người học.
Trả về định dạng JSON thuần túy (không bọc code block markdown nếu có thể) với cấu trúc:
{
  "translation": "Bản dịch tiếng Việt tự nhiên, phù hợp văn cảnh giao tiếp",
  "literal": "Bản dịch sát từng từ (nếu câu có thành ngữ, cấu trúc đặc biệt hoặc khác biệt về trật tự từ so với tiếng Việt, nếu không cần thiết có thể để chuỗi rỗng)",
  "terms": [
    { "term": "Từ/cụm từ quan trọng", "meaning": "Nghĩa ngắn gọn tiếng Việt" }
  ],
  "grammarTip": "Mẹo ngữ pháp hoặc cấu trúc cốt lõi của câu này (ngắn gọn 1-2 câu, ví dụ vị trí động từ, giới từ, thì)"
}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nCâu cần dịch: "${cleanText}"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      const parsed = JSON.parse(cleanJsonOutput(candidate));
      return {
        translation: parsed.translation || '',
        literal: parsed.literal || '',
        terms: Array.isArray(parsed.terms) ? parsed.terms : [],
        grammarTip: parsed.grammarTip || '',
        provider: 'gemini'
      };
    }
  } catch (error) {
    console.warn('Gemini translate error, falling back to Google Translate:', error.response?.data?.error?.message || error.message);
  }

  // Graceful fallback to Google Translate
  const fallbackTranslation = await translateToVietnamese(cleanText, sourceLang);
  return {
    translation: fallbackTranslation,
    literal: '',
    terms: [],
    grammarTip: '',
    provider: 'fallback'
  };
}

/**
 * Future-ready helper: Explain grammar or answer questions about a sentence with Gemini
 */
export async function explainGrammarWithGemini(sentence, question, context = {}, customApiKey = '') {
  const apiKey = getActiveGeminiKey(customApiKey);
  if (!apiKey) {
    throw new Error('Chưa cấu hình Gemini API Key. Vui lòng nhập API Key để sử dụng tính năng hỏi đáp.');
  }

  const prompt = `Bạn là trợ lý ngữ pháp PolyGlot Studio.
Câu đang học: "${sentence}"
Ngôn ngữ: ${context.language === 'en' ? 'Tiếng Anh' : 'Tiếng Đức'}
Câu hỏi của người học: "${question}"

Hãy trả lời ngắn gọn, sư phạm, có ví dụ cụ thể nếu cần.`;

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 }
    },
    {
      timeout: 12000,
      headers: { 'Content-Type': 'application/json' }
    }
  );

  const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { answer: answer.trim(), provider: 'gemini' };
}
