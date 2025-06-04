import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { storage } from '../storage';
import { log } from '../vite';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for specific video handling with memory storage
// We'll use disk storage to avoid memory issues with large files
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log(`Creating directory: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomHash}${ext}`);
  }
});

// File filter to ensure only video files are uploaded
const videoFilter = (req: any, file: Express.Multer.File, cb: any) => {
  console.log('Filtering file:', file.originalname, file.mimetype);
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only MP4, WebM, and OGG video formats are allowed.`), false);
  }
};

// Configure multer with NO size limits for huge uploads
const upload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    // No file size limit - we want to handle files of any size
    // Size limit will be enforced in the route handler instead
    files: 1, // Only allow one file
    parts: 50 // Allow many parts to accommodate file chunks
  }
});

const router = Router();

// Handle large video uploads with multer
router.post('/', (req, res) => {
  console.log('Large video upload request received');
  console.log('Request headers:', req.headers);
  
  // Check content length before processing
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const MAX_SIZE = 250 * 1024 * 1024; // 250MB max size limit
  
  if (contentLength > MAX_SIZE) {
    console.log(`File size (${contentLength} bytes) exceeds the limit of ${MAX_SIZE} bytes`);
    return res.status(413).json({
      error: 'File Too Large',
      message: `The uploaded file (${Math.round(contentLength / (1024 * 1024))}MB) exceeds the maximum allowed size of 250MB.`
    });
  }
  
  // Use multer's single file upload with added error handling
  try {
    console.log('Processing upload with multer...');
    // Use multer's single file upload
    const uploadSingle = upload.single('video');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error('Error during multer upload:', err);
        return res.status(500).json({ 
          error: 'Upload failed', 
          message: err.message || 'Error uploading file',
          details: err.stack || 'No additional details'
        });
      }
      
      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No video file was uploaded' });
      }

      try {      
        const uploadedFile = req.file;
        console.log('Successfully uploaded file:', {
          filename: uploadedFile.filename,
          originalname: uploadedFile.originalname,
          size: uploadedFile.size,
          path: uploadedFile.path
        });
        
        // File path to store in DB
        const dbFilePath = `/uploads/videos/${uploadedFile.filename}`;
        
        // Log all received form fields for debugging
        console.log('Form fields received:', req.body);
        
        // Parse the section and key from the request body
        const { section, key, title, content } = req.body;
        
        if (!section || !key) {
          console.log('Missing required fields:', { section, key });
          return res.status(400).json({ error: 'Section and key are required.' });
        }
        
        try {
          // Update or create the site content
          const existingContent = await storage.getSiteContent(key);
          
          if (existingContent) {
            // Update existing content
            const updatedContent = await storage.updateSiteContent(existingContent.id, {
              title: title || existingContent.title,
              content: content || existingContent.content,
              videoUrl: dbFilePath
            });
            
            console.log('Content updated successfully:', updatedContent);
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
            
            console.log('New content created successfully:', newContent);
            return res.status(201).json(newContent);
          }
        } catch (dbError) {
          console.error('Database error during content update:', dbError);
          return res.status(500).json({ 
            error: 'Database error', 
            message: dbError instanceof Error ? dbError.message : 'Unknown database error',
            details: 'Error occurred while updating content in database'
          });
        }
      } catch (error) {
        console.error('Error handling video upload:', error);
        
        // Provide more detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Error details:', { message: errorMessage, stack: errorStack });
        
        // Return a more structured error response for easier client-side handling
        return res.status(500).json({ 
          error: 'Error processing video upload', 
          message: errorMessage,
          details: errorStack ? errorStack.split('\n')[0] : 'No stack trace available'
        });
      }
    });
  } catch (outerError) {
    console.error('Uncaught error in multer setup:', outerError);
    return res.status(500).json({
      error: 'Server configuration error',
      message: outerError instanceof Error ? outerError.message : 'Unknown server error',
      details: 'Error occurred before file processing began'
    });
  }
});

export default router;