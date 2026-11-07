import express from 'express';
import { translateSentenceWithGemini, explainGrammarWithGemini } from '../services/gemini.service.js';

const router = express.Router();

/**
 * POST /api/ai/translate
 * Body: { text: string, sourceLang?: string }
 * Header: x-gemini-api-key (optional custom user key)
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'de' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Thiếu nội dung câu cần dịch' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] || '';
    const result = await translateSentenceWithGemini(text, sourceLang, customApiKey);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in /api/ai/translate:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/explain
 * Future-ready endpoint for on-demand grammar questions
 * Body: { sentence: string, question: string, language?: string }
 */
router.post('/explain', async (req, res) => {
  try {
    const { sentence, question, language = 'de' } = req.body;
    if (!sentence || !question) {
      return res.status(400).json({ success: false, error: 'Thiếu câu hoặc nội dung câu hỏi' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] || '';
    const result = await explainGrammarWithGemini(sentence, question, { language }, customApiKey);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
