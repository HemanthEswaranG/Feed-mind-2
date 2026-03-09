import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * POST /api/data/upload
 * Upload file for NLP processing
 */
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type
    const allowedExtensions = [
      '.pdf', '.docx', '.doc', '.txt', '.csv', '.xlsx', '.xls',
      '.json', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'
    ];

    const filename = file.originalname;
    const fileExtension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        error: `File type not supported. Allowed: ${allowedExtensions.join(', ')}`
      });
    }

    // Validate file size (already checked by multer, but just in case)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }

    // Save file locally
    const uploadsDir = join(process.cwd(), 'nlp_model', 'data', 'uploads');

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeFilename = `${timestamp}_${filename}`;
    const filePath = join(uploadsDir, safeFilename);

    await writeFile(filePath, file.buffer);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: safeFilename,
      originalName: filename,
      size: file.size,
      type: fileExtension,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error.message || 'Failed to upload file'
    });
  }
});

/**
 * POST /api/data/train
 * Train NLP model with uploaded data
 */
router.post('/train', authenticateUser, async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const NLP_API_URL = process.env.NLP_API_URL || 'http://localhost:8000';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(`${NLP_API_URL}/api/v1/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text().catch(() => 'Training failed');
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Train error:', error);
    res.status(500).json({
      error: error.message || 'Failed to train model'
    });
  }
});

export default router;
