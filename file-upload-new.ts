import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../middleware/auth';
import fileUpload from 'express-fileupload';

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

// Configure express-fileupload middleware
router.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true,
}));

// Simple test endpoint
router.get('/file/test', (req: Request, res: Response) => {
  return res.json({ status: 'File upload system is working' });
});

// Upload image endpoint - simplified and more robust
router.post('/file/upload-image', async (req: Request, res: Response) => {
  console.log('Image upload request received');
  console.log('Headers:', req.headers);
  console.log('Files object type:', typeof req.files);
  console.log('Files object keys:', req.files ? Object.keys(req.files) : 'null');
  
  try {
    // Set the response type to JSON to prevent the browser from parsing as HTML
    res.setHeader('Content-Type', 'application/json');
    
    // Check if files exist in the request
    if (!req.files) {
      console.log('No files object in the request');
      return res.status(400).json({ error: 'No files in request' });
    }
    
    // Check if we have an image file
    if (!req.files.image) {
      console.log('No image field in request files');
      console.log('Available files:', Object.keys(req.files));
      return res.status(400).json({ error: 'No image file uploaded', availableFields: Object.keys(req.files) });
    }
    
    const imageFile = req.files.image;
    console.log('Image file data:', JSON.stringify(imageFile, null, 2));
    
    // Handle array of files
    if (Array.isArray(imageFile)) {
      console.log('Received multiple files, using the first one');
      if (imageFile.length === 0) {
        return res.status(400).json({ error: 'Empty file array' });
      }
      // Use the first file
      const firstFile = imageFile[0];
      console.log('Selected file:', firstFile.name);
      
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(firstFile.name) || '.png';
      const filename = uniqueSuffix + ext;
      const filePath = path.join(imagesDir, filename);
      
      console.log(`Saving file to: ${filePath}`);
      
      try {
        // Move the file from temp location to our uploads directory
        await firstFile.mv(filePath);
        console.log('File saved successfully');
        
        // Generate a public URL for the image
        const baseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = `${baseUrl}/uploads/images/${filename}`;
        
        return res.status(201).json({
          success: true,
          file: {
            filename: filename,
            path: imageUrl,
            size: firstFile.size
          }
        });
      } catch (mvError) {
        console.error('Error moving file:', mvError);
        return res.status(500).json({ 
          error: 'Failed to save file', 
          details: mvError instanceof Error ? mvError.message : 'Unknown error' 
        });
      }
    } else {
      // Handle single file
      console.log('Received single file');
      
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(imageFile.name) || '.png';
      const filename = uniqueSuffix + ext;
      const filePath = path.join(imagesDir, filename);
      
      console.log(`Saving file to: ${filePath}`);
      
      try {
        // Move the file from temp location to our uploads directory
        await imageFile.mv(filePath);
        console.log('File saved successfully');
        
        // Generate a public URL for the image
        const baseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = `${baseUrl}/uploads/images/${filename}`;
        
        return res.status(201).json({
          success: true,
          file: {
            filename: filename,
            path: imageUrl,
            size: imageFile.size
          }
        });
      } catch (mvError) {
        console.error('Error moving file:', mvError);
        
        // Try to use the tempFilePath directly if mv fails
        if (imageFile.tempFilePath && fs.existsSync(imageFile.tempFilePath)) {
          try {
            console.log('Trying to copy from tempFilePath:', imageFile.tempFilePath);
            fs.copyFileSync(imageFile.tempFilePath, filePath);
            console.log('File copied successfully using fs.copyFileSync');
            
            const baseUrl = req.protocol + '://' + req.get('host');
            const imageUrl = `${baseUrl}/uploads/images/${filename}`;
            
            return res.status(201).json({
              success: true,
              method: 'copy',
              file: {
                filename: filename,
                path: imageUrl,
                size: fs.statSync(filePath).size
              }
            });
          } catch (copyError) {
            console.error('Error copying file:', copyError);
            return res.status(500).json({ 
              error: 'Failed to save file (both mv and copy failed)', 
              mvError: mvError instanceof Error ? mvError.message : 'Unknown error',
              copyError: copyError instanceof Error ? copyError.message : 'Unknown error'
            });
          }
        } else {
          return res.status(500).json({ 
            error: 'Failed to save file and no tempFilePath available', 
            details: mvError instanceof Error ? mvError.message : 'Unknown error' 
          });
        }
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ 
      error: 'Failed to upload image', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Upload video endpoint
router.post('/file/upload-video', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.video) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    const videoFile = req.files.video;
    
    if (Array.isArray(videoFile)) {
      return res.status(400).json({ error: 'Multiple files not supported' });
    }
    
    // Validate it's a video
    if (!videoFile.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'File must be a video' });
    }
    
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(videoFile.name) || '.mp4';
    const filename = uniqueSuffix + ext;
    const filePath = path.join(videosDir, filename);
    
    // Move the file from temp location to our uploads directory
    await videoFile.mv(filePath);
    
    // Generate a public URL for the video
    const baseUrl = req.protocol + '://' + req.get('host');
    const videoUrl = `${baseUrl}/uploads/videos/${filename}`;
    
    return res.status(201).json({
      success: true,
      file: {
        filename: filename,
        path: videoUrl,
        size: videoFile.size
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