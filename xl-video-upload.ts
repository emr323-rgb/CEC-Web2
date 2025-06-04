import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { log } from '../vite';
import { storage } from '../storage';

// Define uploads directory
const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
const videosDir = path.join(uploadsBaseDir, 'videos');

// Ensure directories exist
if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

console.log('XL Video Upload - Uploads directory:', videosDir);

// Configure multer for specific video handling
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('XL: Setting destination directory to', videosDir);
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomHash}${ext}`;
    console.log('XL: Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to ensure only video files are uploaded
const videoFilter = (req: any, file: Express.Multer.File, cb: any) => {
  console.log('XL: Filtering file:', file.originalname, file.mimetype);
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only MP4, WebM, and OGG video formats are allowed.`), false);
  }
};

// Configure multer with NO size limits
const upload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
});

const router = Router();

// Explicitly handle large video uploads with multer
router.post('/', (req, res) => {
  console.log('XL VIDEO UPLOAD: Request received');
  console.log('XL VIDEO UPLOAD: Headers:', req.headers);
  
  // Process the upload using multer's single file upload
  const uploadSingle = upload.single('video');
  
  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error('XL: Error during multer upload:', err);
      return res.status(500).json({ 
        error: 'Upload failed', 
        message: err.message || 'Error uploading file',
        details: err.stack || 'No additional details'
      });
    }
    
    // If no file was uploaded
    if (!req.file) {
      console.error('XL: No file was uploaded');
      return res.status(400).json({ error: 'No video file was uploaded' });
    }

    try {      
      const uploadedFile = req.file;
      console.log('XL: Successfully uploaded file:', {
        filename: uploadedFile.filename,
        originalname: uploadedFile.originalname,
        size: uploadedFile.size,
        path: uploadedFile.path
      });
      
      // File path to store in DB
      const dbFilePath = `/uploads/videos/${uploadedFile.filename}`;
      
      // Log all received form fields for debugging
      console.log('XL: Form fields received:', req.body);
      
      // Parse the section and key from the request body
      const { section, key, title, content } = req.body;
      
      if (!section || !key) {
        console.log('XL: Missing required fields:', { section, key });
        return res.status(400).json({ error: 'Section and key are required.' });
      }
      
      // Update or create the site content
      const existingContent = await storage.getSiteContent(key);
      
      if (existingContent) {
        // Update existing content
        const updatedContent = await storage.updateSiteContent(existingContent.id, {
          title: title || existingContent.title,
          content: content || existingContent.content,
          videoUrl: dbFilePath
        });
        
        console.log('XL: Content updated successfully');
        return res.status(200).json(updatedContent);
      } else {
        // Create new content
        const newContent = await storage.createSiteContent({
          key,
          section,
          title: title || '',
          content: content || '',
          videoUrl: dbFilePath
        });
        
        console.log('XL: New content created successfully');
        return res.status(201).json(newContent);
      }
    } catch (error) {
      console.error('XL: Error handling video upload:', error);
      
      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('XL: Error details:', { message: errorMessage, stack: errorStack });
      
      // Return a more structured error response for easier client-side handling
      return res.status(500).json({ 
        error: 'Error processing video upload', 
        message: errorMessage,
        details: errorStack ? errorStack.split('\n')[0] : 'No stack trace available'
      });
    }
  });
});

export default router;