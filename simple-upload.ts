import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();

// Create storage directories if they don't exist
const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
const imagesDir = path.join(uploadsBaseDir, 'simple-images');

console.log('Simple upload - Upload directories:', {
  uploadsBaseDir,
  imagesDir
});

[uploadsBaseDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Test endpoint
router.get('/simple-upload/test', (req, res) => {
  return res.json({ status: 'Simple upload system is working' });
});

// Manual file handling - most basic implementation
router.post('/simple-upload/image', (req, res) => {
  try {
    // Set proper headers to prevent browser issues
    res.setHeader('Content-Type', 'application/json');
    
    console.log('Simple upload request received');
    console.log('Headers:', req.headers);
    
    // Buffer to collect the file data
    const chunks: Buffer[] = [];
    let totalSize = 0;
    
    // Detect file extension from content-type if possible
    let fileExt = '.png';
    const contentType = req.headers['content-type'];
    if (contentType) {
      console.log('Content-Type:', contentType);
      if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        fileExt = '.jpg';
      } else if (contentType.includes('image/png')) {
        fileExt = '.png';
      } else if (contentType.includes('image/gif')) {
        fileExt = '.gif';
      } else if (contentType.includes('image/webp')) {
        fileExt = '.webp';
      }
    }
    
    // Generate a unique filename
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${fileExt}`;
    const filepath = path.join(imagesDir, filename);
    
    console.log('Handling simple upload to:', filepath);
    
    // On data chunk received
    req.on('data', (chunk) => {
      console.log(`Received chunk of ${chunk.length} bytes`);
      chunks.push(chunk);
      totalSize += chunk.length;
    });
    
    // On request completion
    req.on('end', () => {
      console.log(`Upload complete: ${totalSize} bytes received`);
      
      // If no data was received
      if (totalSize === 0) {
        console.error('No data received in the request');
        return res.status(400).json({ error: 'No data received' });
      }
      
      try {
        // Combine chunks
        const buffer = Buffer.concat(chunks);
        
        // Check if the file appears to be an image
        const magicNumbers = {
          jpeg: [0xFF, 0xD8, 0xFF],
          png: [0x89, 0x50, 0x4E, 0x47],
          gif: [0x47, 0x49, 0x46]
        };
        
        const firstBytes = Array.from(buffer.slice(0, 4));
        const fileType = 
          firstBytes.slice(0, 3).every((val, i) => val === magicNumbers.jpeg[i]) ? 'jpeg' :
          firstBytes.slice(0, 4).every((val, i) => val === magicNumbers.png[i]) ? 'png' :
          firstBytes.slice(0, 3).every((val, i) => val === magicNumbers.gif[i]) ? 'gif' : 'unknown';
          
        console.log(`Detected file type from content: ${fileType}`);
        
        if (fileType === 'unknown') {
          console.warn('Warning: File does not appear to be a standard image format');
          console.log('First 20 bytes:', Array.from(buffer.slice(0, 20)));
        }
        
        // Write the file
        fs.writeFileSync(filepath, buffer);
        
        console.log('File saved successfully to:', filepath);
        
        // Send success response
        const baseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = `${baseUrl}/uploads/simple-images/${filename}`;
        
        res.status(201).json({
          success: true,
          file: {
            filename: filename,
            path: imageUrl,
            size: totalSize,
            detectedType: fileType
          }
        });
      } catch (err) {
        console.error('Error saving file:', err);
        res.status(500).json({ 
          error: 'Failed to save file', 
          details: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    });
    
    // Handle errors during upload
    req.on('error', (err) => {
      console.error('Error during upload:', err);
      res.status(500).json({ 
        error: 'Failed during upload', 
        details: err.message 
      });
    });
    
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ 
      error: 'Failed to process upload', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;