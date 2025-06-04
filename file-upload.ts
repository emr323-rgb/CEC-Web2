import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create storage directories if they don't exist
const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
const imagesDir = path.join(uploadsBaseDir, 'images');
const videosDir = path.join(uploadsBaseDir, 'videos');

console.log('Uploads directory paths:', {
  uploadsBaseDir,
  imagesDir,
  videosDir
});

[uploadsBaseDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Configure a simple multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('File being uploaded:', file);
    // Choose destination based on file type
    const isVideo = file.mimetype.startsWith('video/');
    const dest = isVideo ? videosDir : imagesDir;
    console.log(`Destination directory for ${file.originalname}: ${dest}`);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const originalName = file.originalname || 'unknown';
    const ext = path.extname(originalName) || '.bin';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = uniqueSuffix + ext;
    console.log(`Generated filename for ${originalName}: ${newFilename}`);
    cb(null, newFilename);
  }
});

// Filter files by type with better error handling
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('Filtering file:', file);
  try {
    if (file.fieldname === 'image') {
      // Only accept images
      if (!file.mimetype.startsWith('image/')) {
        console.log(`Rejected file ${file.originalname}: not an image`);
        cb(null, false);
        return;
      }
    } else if (file.fieldname === 'video') {
      // Only accept videos
      if (!file.mimetype.startsWith('video/')) {
        console.log(`Rejected file ${file.originalname}: not a video`);
        cb(null, false);
        return;
      }
    }
    console.log(`Accepted file ${file.originalname}`);
    cb(null, true);
  } catch (error) {
    console.error('Error in file filter:', error);
    cb(null, false);
  }
};

// Set up multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file size limit
  },
});

// Simple test endpoint
router.get('/file/test', (req: Request, res: Response) => {
  return res.json({ status: 'File upload system is working' });
});

// Upload image endpoint
router.post('/file/upload-image', upload.single('image'), async (req: Request, res: Response) => {
  console.log('Image upload request received');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    if (!req.file) {
      console.log('No file received in the request');
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    // Generate a public URL for the image
    const baseUrl = req.protocol + '://' + req.get('host');
    const imageUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
    console.log('Generated image URL:', imageUrl);
    
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
    return res.status(500).json({ error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Upload video endpoint
router.post('/file/upload-video', authenticate, upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
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
    return res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get video settings endpoint
router.get('/file/video-settings', authenticate, async (req: Request, res: Response) => {
  try {
    // Get all video files in the videos directory
    const files = fs.readdirSync(videosDir);
    
    if (files.length > 0) {
      // For now, just return the first video file
      const videoFile = files[0];
      const stats = fs.statSync(path.join(videosDir, videoFile));
      const baseUrl = req.protocol + '://' + req.get('host');
      
      return res.json({
        exists: true,
        name: videoFile,
        size: stats.size,
        lastModified: stats.mtime,
        path: `${baseUrl}/uploads/videos/${videoFile}`
      });
    } else {
      return res.json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Error getting video settings:', error);
    return res.status(500).json({ error: 'Failed to get video settings' });
  }
});

// Delete video endpoint
router.delete('/file/delete-video', authenticate, async (req: Request, res: Response) => {
  try {
    // Get all video files in the videos directory
    const files = fs.readdirSync(videosDir);
    
    if (files.length > 0) {
      // Delete the first video file
      fs.unlinkSync(path.join(videosDir, files[0]));
      return res.json({ success: true });
    } else {
      return res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;