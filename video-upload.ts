import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { storage } from '../storage';
import { log } from '../vite';
import { UploadedFile } from 'express-fileupload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post('/', async (req, res) => {
  try {
    console.log('Video upload request received');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Content-Length:', req.headers['content-length']);
    
    // Handle 413 Payload Too Large errors more gracefully
    if (req.headers['content-length'] && 
        parseInt(req.headers['content-length'] as string) > 210 * 1024 * 1024) {
      console.log('File too large - rejecting request');
      return res.status(413).json({ 
        error: 'File too large', 
        message: 'The uploaded file exceeds the maximum allowed size of 200MB'
      });
    }
    
    // Enhanced logging for file uploads
    if (!req.files) {
      console.log('req.files is null or undefined');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Content-Length:', req.headers['content-length']);
      return res.status(400).json({ error: 'No files were uploaded. Make sure your form includes enctype="multipart/form-data"' });
    }
    
    if (Object.keys(req.files).length === 0) {
      console.log('req.files exists but is empty');
      console.log('req.files properties:', Object.getOwnPropertyNames(req.files));
      return res.status(400).json({ error: 'No files were found in the request' });
    }
    
    console.log('Files received:', Object.keys(req.files));
    
    // Handle video upload
    const videoFile = req.files.video as UploadedFile;
    if (!videoFile) {
      console.log('No file with key "video" found in request');
      console.log('Available file keys:', Object.keys(req.files));
      return res.status(400).json({ error: 'No video file provided with key "video"' });
    }
    
    // Additional validation of file size
    console.log(`Video file size: ${videoFile.size} bytes (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB)`);
    if (videoFile.truncated) {
      console.log('File was truncated due to size limits');
      return res.status(413).json({ 
        error: 'File too large', 
        message: 'The uploaded file was truncated because it exceeds the maximum allowed size'
      });
    }
    
    // Validate that it's actually a video file
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedMimeTypes.includes(videoFile.mimetype)) {
      console.log(`Invalid mime type: ${videoFile.mimetype}`);
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload a video file (MP4, WebM, or Ogg).' 
      });
    }
    
    console.log('Video file details:', {
      name: videoFile.name,
      size: videoFile.size,
      mimetype: videoFile.mimetype,
      md5: videoFile.md5,
      tempFilePath: videoFile.tempFilePath,
    });

    // Generate a unique filename
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000000);
    const ext = path.extname(videoFile.name);
    const fileName = `${timestamp}-${randomNum}${ext}`;
    
    const uploadPath = path.join(uploadsDir, fileName);
    
    // Move the file using the temp file path if available
    try {
      if (videoFile.tempFilePath && fs.existsSync(videoFile.tempFilePath)) {
        // If useTempFiles is enabled, move the temp file instead of using mv()
        console.log(`Moving temp file from ${videoFile.tempFilePath} to ${uploadPath}`);
        
        // For large files, use stream copying instead of fs.copyFileSync
        // to avoid memory issues
        console.log(`Using stream to copy large file (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB)`);
        await new Promise<void>((resolve, reject) => {
          const readStream = fs.createReadStream(videoFile.tempFilePath);
          const writeStream = fs.createWriteStream(uploadPath);
          
          // Handle events
          readStream.on('error', (err) => {
            console.error('Error in read stream:', err);
            reject(err);
          });
          
          writeStream.on('error', (err) => {
            console.error('Error in write stream:', err);
            reject(err);
          });
          
          writeStream.on('finish', () => {
            console.log('Stream copy completed successfully');
            resolve();
          });
          
          // Pipe the streams
          readStream.pipe(writeStream);
        });
        
        // Remove temp file after successful copy
        fs.unlinkSync(videoFile.tempFilePath);
      } else {
        // Use the standard mv() method if no temp file path
        console.log(`Using mv() method to upload file to ${uploadPath}`);
        await videoFile.mv(uploadPath);
      }
      console.log(`File successfully moved to ${uploadPath}`);
    } catch (error) {
      const moveError = error as Error;
      console.error('Error moving video file:', moveError);
      return res.status(500).json({ error: 'Failed to save the video file', details: moveError.message });
    }
    
    // File path to store in DB
    const dbFilePath = `/uploads/videos/${fileName}`;
    
    // Parse the section and key from the request body
    const { section, key, title, content } = req.body;
    
    if (!section || !key) {
      console.log('Missing required fields:', { section, key });
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
      
      res.status(200).json(updatedContent);
    } else {
      // Create new content
      const newContent = await storage.createSiteContent({
        key,
        section,
        title: title || '',
        content: content || '',
        videoUrl: dbFilePath
      });
      
      res.status(201).json(newContent);
    }
    
    log(`Video uploaded successfully: ${fileName}`, 'video-upload');
  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    // Return a more structured error response for easier client-side handling
    res.status(500).json({ 
      error: 'Error uploading video', 
      message: errorMessage,
      details: errorStack ? errorStack.split('\n')[0] : 'No stack trace available'
    });
  }
});

export default router;