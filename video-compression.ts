import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define video upload and compressed video directories
const VIDEO_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'videos');
const COMPRESSED_VIDEO_DIR = path.join(process.cwd(), 'uploads', 'compressed-videos');

// Ensure directories exist
if (!fs.existsSync(VIDEO_UPLOAD_DIR)) {
  fs.mkdirSync(VIDEO_UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(COMPRESSED_VIDEO_DIR)) {
  fs.mkdirSync(COMPRESSED_VIDEO_DIR, { recursive: true });
}

// Helper function to format file size
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to check if ffmpeg is available
function isFfmpegAvailable() {
  try {
    execSync('which ffmpeg');
    return true;
  } catch (error) {
    console.error('FFmpeg is not installed or not in PATH');
    return false;
  }
}

// GET /api/video-compression/list - List all videos and their compressed versions
router.get('/list', (req, res) => {
  try {
    const originalFiles: string[] = [];
    const compressedFiles: string[] = [];
    
    // Read original videos directory
    if (fs.existsSync(VIDEO_UPLOAD_DIR)) {
      const files = fs.readdirSync(VIDEO_UPLOAD_DIR);
      originalFiles.push(...files.filter(f => f.match(/\.(mp4|webm|mov)$/i)));
    }
    
    // Read compressed videos directory
    if (fs.existsSync(COMPRESSED_VIDEO_DIR)) {
      const files = fs.readdirSync(COMPRESSED_VIDEO_DIR);
      compressedFiles.push(...files.filter(f => f.match(/\.(mp4|webm|mov)$/i)));
    }
    
    // Process file information
    const allFiles = [...originalFiles, ...compressedFiles].map(filename => {
      const isCompressed = filename.includes('-compressed');
      const filePath = path.join(
        isCompressed ? COMPRESSED_VIDEO_DIR : VIDEO_UPLOAD_DIR,
        filename
      );
      
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        created: stats.birthtime.toISOString(),
        hasCompressedVersion: false, // Will be set later
        compressedVersions: [], // Will be populated later
      };
    });
    
    // Group compressed versions with their originals
    const videoMap = new Map();
    
    allFiles.forEach(file => {
      if (file.filename.includes('-compressed')) {
        // This is a compressed version
        const parts = file.filename.split('-compressed');
        const originalName = parts[0] + path.extname(file.filename);
        const quality = parts[1].split('.')[0].replace(/^-/, '') || 'default';
        
        const compressionRatio = (originalSize: number, compressedSize: number) => {
          return (originalSize / compressedSize).toFixed(1);
        };
        
        if (videoMap.has(originalName)) {
          const original = videoMap.get(originalName);
          original.hasCompressedVersion = true;
          original.compressedVersions.push({
            filename: file.filename,
            size: file.size,
            sizeFormatted: file.sizeFormatted,
            quality: quality,
            compressionRatio: compressionRatio(original.size, file.size),
          });
        }
      } else {
        // This is an original file
        videoMap.set(file.filename, { ...file, compressedVersions: [] });
      }
    });
    
    res.json(Array.from(videoMap.values()));
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

// POST /api/video-compression/compress/:filename - Compress a video
router.post('/compress/:filename', async (req, res) => {
  const { filename } = req.params;
  const quality = req.query.quality as string || 'medium';
  
  // Quality settings mapping
  const qualitySettings: Record<string, { crf: number, preset: string }> = {
    low: { crf: 28, preset: 'superfast' },
    medium: { crf: 23, preset: 'medium' },
    high: { crf: 18, preset: 'slow' }
  };
  
  // Get settings based on quality or use medium as default
  const settings = qualitySettings[quality] || qualitySettings.medium;
  
  try {
    // Check if ffmpeg is available
    if (!isFfmpegAvailable()) {
      return res.status(500).json({ error: 'FFmpeg is not installed on the server' });
    }
    
    const originalPath = path.join(VIDEO_UPLOAD_DIR, filename);
    
    // Check if the original file exists
    if (!fs.existsSync(originalPath)) {
      return res.status(404).json({ error: 'Original video file not found' });
    }
    
    // Create output filename with quality info
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);
    const compressedFilename = `${nameWithoutExt}-compressed-${quality}${ext}`;
    const outputPath = path.join(COMPRESSED_VIDEO_DIR, compressedFilename);
    
    console.log(`Compressing video: ${filename} with quality: ${quality}`);
    console.log(`Original path: ${originalPath}`);
    console.log(`Output path: ${outputPath}`);
    
    // Run FFmpeg command for compression
    const ffmpegCommand = `ffmpeg -i "${originalPath}" -c:v libx264 -crf ${settings.crf} -preset ${settings.preset} -c:a aac "${outputPath}"`;
    
    console.log(`Running command: ${ffmpegCommand}`);
    execSync(ffmpegCommand);
    
    // Get file sizes for original and compressed files
    const originalStats = fs.statSync(originalPath);
    const compressedStats = fs.statSync(outputPath);
    const originalSize = originalStats.size;
    const compressedSize = compressedStats.size;
    
    // Calculate compression ratio
    const compressionRatio = (originalSize / compressedSize).toFixed(1);
    
    res.json({
      message: 'Video compressed successfully',
      originalFilename: filename,
      compressedFilename,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}x`,
      quality
    });
  } catch (error) {
    console.error('Error compressing video:', error);
    res.status(500).json({ 
      error: 'Failed to compress video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/video-compression/status - Check if ffmpeg is available
router.get('/status', (req, res) => {
  try {
    const ffmpegAvailable = isFfmpegAvailable();
    res.json({ 
      ffmpegAvailable,
      message: ffmpegAvailable ? 
        'FFmpeg is available for video compression' : 
        'FFmpeg is not installed. Video compression will not work.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check ffmpeg status' });
  }
});

export default router;