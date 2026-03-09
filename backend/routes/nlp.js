import express from 'express';

const router = express.Router();
const NLP_API_URL = process.env.NLP_API_URL || 'http://localhost:8000';

/**
 * POST /api/nlp/suggest-questions
 * Forward request to NLP model API
 */
router.post('/suggest-questions', async (req, res) => {
  try {
    const body = req.body;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${NLP_API_URL}/api/v1/suggest-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text().catch(() => 'NLP API error');
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[nlp/suggest-questions]', err);
    res.status(503).json({
      error: err?.message ?? 'Failed to reach NLP service',
    });
  }
});

/**
 * POST /api/nlp/suggest-from-document
 * Generate questions from uploaded document
 */
router.post('/suggest-from-document', async (req, res) => {
  try {
    const body = req.body;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${NLP_API_URL}/api/v1/suggest-from-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text().catch(() => 'NLP API error');
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[nlp/suggest-from-document]', err);
    res.status(503).json({
      error: err?.message ?? 'Failed to reach NLP service',
    });
  }
});

export default router;
