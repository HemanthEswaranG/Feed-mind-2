import express from 'express';
import { prisma } from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';
import { generateFormFromPrompt, suggestQuestions, analyzeResponses } from '../controllers/aiController.js';
import { decrypt } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/ai/generate-form
 * Generate a form from a text prompt using AI
 */
router.post('/generate-form', authenticateUser, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 10) {
      return res.status(400).json({ error: 'Prompt too short (minimum 10 characters)' });
    }

    const apiKey = req.user.customApiKey ? decrypt(req.user.customApiKey) : null;
    const result = await generateFormFromPrompt(prompt, apiKey);

    res.json(result);
  } catch (error) {
    console.error('Generate form error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

/**
 * POST /api/ai/suggest-questions
 * Suggest additional questions for a form using AI
 */
router.post('/suggest-questions', authenticateUser, async (req, res) => {
  try {
    const { existingQuestions, context } = req.body;

    if (!existingQuestions || !Array.isArray(existingQuestions)) {
      return res.status(400).json({ error: 'existingQuestions array is required' });
    }

    const apiKey = req.user.customApiKey ? decrypt(req.user.customApiKey) : null;
    const suggestions = await suggestQuestions(existingQuestions, context || '', apiKey);

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggest questions error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze form responses using AI
 */
router.post('/analyze', authenticateUser, async (req, res) => {
  try {
    const { formId } = req.body;

    if (!formId) {
      return res.status(400).json({ error: 'formId is required' });
    }

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: req.user.id },
      include: {
        responses: {
          include: { answers: true },
        },
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.responses || form.responses.length === 0) {
      return res.status(400).json({ error: 'No responses to analyze' });
    }

    const apiKey = req.user.customApiKey ? decrypt(req.user.customApiKey) : null;
    const analysis = await analyzeResponses(form.title, form.responses, apiKey);

    res.json(analysis);
  } catch (error) {
    console.error('Analyze responses error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

export default router;
