import express from 'express';
import { prisma } from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';
import { encrypt } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            forms: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, image } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/user/apikey
 * Update user's custom API key
 */
router.put('/apikey', authenticateUser, async (req, res) => {
  try {
    const { apiKey } = req.body;

    const encrypted = apiKey ? encrypt(apiKey) : null;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { customApiKey: encrypted },
    });

    res.json({ success: true, message: 'API key updated successfully' });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/user/account
 * Delete user account
 */
router.delete('/account', authenticateUser, async (req, res) => {
  try {
    // Delete user and all associated data (cascade is set in Prisma schema)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
