import express from 'express';
import { prisma } from '../utils/prisma.js';
import { hashIP } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/submit/:formId
 * Submit a response to a form (public endpoint)
 */
router.post('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.isPublished) {
      return res.status(403).json({ error: 'Form not published' });
    }

    if (form.expiresAt && new Date() > form.expiresAt) {
      return res.status(410).json({ error: 'Form expired' });
    }

    // Get IP address from request
    const ip = req.headers['x-forwarded-for'] || 
              req.headers['x-real-ip'] || 
              req.connection.remoteAddress || 
              'unknown';
    const ipHash = hashIP(Array.isArray(ip) ? ip[0] : ip);

    // Check if multiple submissions are allowed
    if (!form.allowMultiple) {
      const existing = await prisma.response.findFirst({
        where: { formId: form.id, ipHash },
      });

      if (existing) {
        return res.status(409).json({ error: 'Already submitted' });
      }
    }

    const { answers, respondentEmail, metadata } = req.body;

    // Validate required questions
    for (const question of form.questions) {
      if (question.required) {
        const answer = answers?.find((a) => a.questionId === question.id);
        if (!answer || !answer.value?.trim()) {
          return res.status(400).json({
            error: `Question "${question.label}" is required`,
          });
        }
      }
    }

    // Check for potential spam (time too fast)
    const timeOnForm = metadata?.timeOnForm || 0;
    const isSpam = timeOnForm < 10;

    const response = await prisma.response.create({
      data: {
        formId: form.id,
        ipHash,
        isSpam,
        isFlagged: isSpam,
        metadata: {
          ...(metadata || {}),
          ...(respondentEmail ? { respondentEmail } : {}),
        },
        answers: {
          create: (answers || []).map((a) => ({
            questionId: a.questionId,
            value: a.value || '',
          })),
        },
      },
      include: { answers: true },
    });

    res.status(201).json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

/**
 * GET /api/submit/:formId/public
 * Get public form details (no auth required)
 */
router.get('/:formId/public', async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { 
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } }
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.isPublished) {
      return res.status(403).json({ error: 'Form not published' });
    }

    // Return form without sensitive data
    const publicForm = {
      id: form.id,
      title: form.title,
      description: form.description,
      questions: form.questions,
      theme: form.theme,
      isAnonymous: form.isAnonymous,
      expiresAt: form.expiresAt,
      responseCount: form._count.responses,
    };

    res.json(publicForm);
  } catch (error) {
    console.error('Get public form error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
