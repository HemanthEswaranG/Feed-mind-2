import express from 'express';
import { prisma } from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/forms
 * Get all forms for authenticated user
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { responses: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(forms);
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/forms
 * Create a new form
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const data = req.body;

    const form = await prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        userId: req.user.id,
        isAnonymous: data.isAnonymous || false,
        allowMultiple: data.allowMultiple || false,
        theme: data.theme,
        questions: {
          create: (data.questions || []).map((q, i) => ({
            type: q.type,
            label: q.label,
            placeholder: q.placeholder,
            required: q.required || false,
            options: q.options,
            order: q.order ?? i,
            aiGenerated: q.aiGenerated || false,
          })),
        },
      },
      include: { questions: true },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/forms/responses/all
 * Get all responses across the authenticated user's forms
 */
router.get('/responses/all', authenticateUser, async (req, res) => {
  try {
    const responses = await prisma.response.findMany({
      where: {
        form: {
          userId: req.user.id,
        },
      },
      include: {
        form: {
          select: {
            id: true,
            title: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                label: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const mapped = responses.map((response) => ({
      id: response.id,
      formId: response.formId,
      formTitle: response.form.title,
      submittedAt: response.submittedAt,
      integrityScore: response.integrityScore,
      sentimentScore: response.sentimentScore,
      isSpam: response.isSpam,
      isFlagged: response.isFlagged,
      respondent:
        (response.metadata && typeof response.metadata === 'object' && response.metadata.respondentEmail) ||
        'Anonymous',
      preview: response.answers[0]?.value || 'No response text',
      answers: response.answers.map((answer) => ({
        questionId: answer.questionId,
        questionLabel: answer.question?.label || 'Question',
        questionType: answer.question?.type || 'SHORT_TEXT',
        value: answer.value,
      })),
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Get all responses error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/forms/responses/:responseId/spam
 * Mark a response as spam
 */
router.patch('/responses/:responseId/spam', authenticateUser, async (req, res) => {
  try {
    const { responseId } = req.params;

    const existing = await prisma.response.findFirst({
      where: {
        id: responseId,
        form: { userId: req.user.id },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Response not found' });
    }

    const updated = await prisma.response.update({
      where: { id: responseId },
      data: { isSpam: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Mark spam error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/forms/responses/:responseId/flag
 * Toggle flagged state for a response
 */
router.patch('/responses/:responseId/flag', authenticateUser, async (req, res) => {
  try {
    const { responseId } = req.params;
    const { flagged } = req.body;

    const existing = await prisma.response.findFirst({
      where: {
        id: responseId,
        form: { userId: req.user.id },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Response not found' });
    }

    const updated = await prisma.response.update({
      where: { id: responseId },
      data: { isFlagged: Boolean(flagged) },
    });

    res.json(updated);
  } catch (error) {
    console.error('Flag response error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/forms/responses/:responseId
 * Delete a response belonging to one of the user's forms
 */
router.delete('/responses/:responseId', authenticateUser, async (req, res) => {
  try {
    const { responseId } = req.params;

    const existing = await prisma.response.findFirst({
      where: {
        id: responseId,
        form: { userId: req.user.id },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Response not found' });
    }

    await prisma.response.delete({ where: { id: responseId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/forms/:formId
 * Get a specific form
 */
router.get('/:formId', authenticateUser, async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: req.user.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } },
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/forms/:formId
 * Update a form
 */
router.put('/:formId', authenticateUser, async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: req.user.id },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const data = req.body;
    const updated = await prisma.form.update({
      where: { id: formId },
      data: {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        allowMultiple: data.allowMultiple,
        theme: data.theme,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/forms/:formId
 * Delete a form
 */
router.delete('/:formId', authenticateUser, async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: req.user.id },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await prisma.form.delete({ where: { id: formId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/forms/:formId/publish
 * Toggle form published status
 */
router.post('/:formId/publish', authenticateUser, async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: req.user.id },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const updated = await prisma.form.update({
      where: { id: formId },
      data: { isPublished: !form.isPublished },
    });

    res.json(updated);
  } catch (error) {
    console.error('Publish form error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/forms/:formId/responses
 * Get all responses for a form
 */
router.get('/:formId/responses', authenticateUser, async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: req.user.id },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responses = await prisma.response.findMany({
      where: { formId },
      include: { answers: true },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(responses);
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
