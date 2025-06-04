import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for embedded video update
const embeddedVideoSchema = z.object({
  section: z.string(),
  key: z.string(),
  embeddedVideoId: z.string(),
  videoPlatform: z.enum(['youtube', 'vimeo']),
});

// Schema for retrieving embedded video
const retrieveVideoSchema = z.object({
  key: z.string(),
});

// Get embedded video content by key
router.get('/site-content/embedded-video/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ message: 'Content key is required' });
    }

    // Try to get the content
    const content = await storage.getSiteContent(key);

    if (!content) {
      return res.status(404).json({ 
        message: 'Content not found',
        key,
        error: false,
        // Add empty defaults to help the client
        defaultValues: {
          embeddedVideoId: '',
          videoPlatform: 'youtube',
          section: 'homepage',
          key,
          title: '',
          content: ''
        }
      });
    }

    return res.status(200).json(content);
  } catch (err: any) {
    console.error(`Error retrieving embedded video content (${req.params.key}):`, err);
    return res.status(500).json({ 
      message: err.message || 'Server error',
      error: true
    });
  }
});

// Update embedded video for a site content
router.post('/site-content/embedded-video/:key', async (req, res) => {
  try {
    // Log to help diagnose issues
    console.log(`Processing embedded video update for key: ${req.params.key}`);
    console.log('Request body:', JSON.stringify(req.body));
    
    // Validate request body
    const validationResult = embeddedVideoSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validationResult.error.errors,
        error: true
      });
    }
    
    const { section, key, embeddedVideoId, videoPlatform } = validationResult.data;
    
    // Check if content exists
    const existingContent = await storage.getSiteContent(key);
    
    if (existingContent) {
      // Update existing content with embedded video info
      const updatedContent = await storage.updateSiteContent(existingContent.id, {
        embeddedVideoId,
        videoPlatform,
      });
      
      console.log(`Updated existing content for key: ${key}`);
      return res.status(200).json(updatedContent);
    } else {
      // Create new content entry with embedded video info
      const newContent = await storage.createSiteContent({
        section,
        key,
        embeddedVideoId,
        videoPlatform,
        title: '',
        content: '',
      });
      
      console.log(`Created new content for key: ${key}`);
      return res.status(201).json(newContent);
    }
  } catch (err: any) {
    console.error(`Error updating embedded video for key (${req.params.key}):`, err);
    return res.status(500).json({ 
      message: err.message || 'Server error',
      error: true
    });
  }
});

export default router;