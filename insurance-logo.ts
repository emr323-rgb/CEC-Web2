import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up storage for insurance logos
const insuranceLogosDir = path.join(process.cwd(), 'public', 'uploads', 'insurance-logos');

// Ensure the insurance logos directory exists
if (!fs.existsSync(insuranceLogosDir)) {
  fs.mkdirSync(insuranceLogosDir, { recursive: true });
}

console.log(`Insurance logos directory path: ${insuranceLogosDir}`);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, insuranceLogosDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  },
});

// Define file size limits and types
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.') as any);
    }
  },
});

// POST endpoint to upload an insurance logo
router.post('/', upload.single('image'), (req, res) => {
  try {
    // Authentication check happens at the route level in routes.ts
    // Skip authentication check here as it's handled in the route registration
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get the URL path to the uploaded file
    const relativePath = path.join('uploads', 'insurance-logos', req.file.filename);
    const imageUrl = `/${relativePath.replace(/\\/g, '/')}`;
    
    res.status(201).json({
      message: 'File uploaded successfully',
      imageUrl,
      file: req.file,
    });
  } catch (error: any) {
    console.error('Error handling insurance logo upload:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

export default router;