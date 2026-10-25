import express from 'express';
import { lookupWord, translateToVietnamese } from '../services/dict.service.js';

const router = express.Router();

/**
 * GET /api/dict/lookup?word=haus&lang=de
 */
router.get('/lookup', async (req, res) => {
  try {
    const { word, lang = 'de' } = req.query;
    if (!word) {
      return res.status(400).json({ success: false, error: 'Thiếu từ cần tra cứu' });
    }

    const data = await lookupWord(word, lang);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/dict/translate
 * Body: { text: string, fromLang?: string }
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, fromLang = 'auto' } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Thiếu nội dung câu cần dịch' });
    }

    const translation = await translateToVietnamese(text, fromLang);
    return res.json({ success: true, translation });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
