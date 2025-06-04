import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Create storage directories if they don't exist
const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
const imagesDir = path.join(uploadsBaseDir, 'images');
const videosDir = path.join(uploadsBaseDir, 'videos');

console.log('Direct upload - Upload directories:', {
  uploadsBaseDir,
  imagesDir,
  videosDir
});

// Ensure directories exist
[uploadsBaseDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Simple multer setup for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, uniqueSuffix + ext);
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Simple multer setup for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, uniqueSuffix + ext);
  }
});

const videoUpload = multer({ 
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Test endpoint
router.get('/direct-upload/test', (req, res) => {
  return res.json({ status: 'Direct upload system is working' });
});

// Image upload endpoint
router.post('/direct-upload/image', imageUpload.single('image'), (req, res) => {
  console.log('Image upload request received');
  
  try {
    if (!req.file) {
      console.log('No file received in the request');
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    console.log('File uploaded:', req.file);
    
    // Generate a public URL for the image
    const baseUrl = req.protocol + '://' + req.get('host');
    const imageUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
    
    return res.status(201).json({
      success: true,
      file: {
        filename: req.file.filename,
        path: imageUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ 
      error: 'Failed to upload image', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Video upload endpoint
router.post('/direct-upload/video', videoUpload.single('video'), (req, res) => {
  console.log('Video upload request received');
  
  try {
    if (!req.file) {
      console.log('No file received in the request');
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    console.log('File uploaded:', req.file);
    
    // Generate a public URL for the video
    const baseUrl = req.protocol + '://' + req.get('host');
    const videoUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;
    
    return res.status(201).json({
      success: true,
      file: {
        filename: req.file.filename,
        path: videoUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ 
      error: 'Failed to upload video', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;