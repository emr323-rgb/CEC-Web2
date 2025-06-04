import express from 'express';
import { db } from '../db';
import { insuranceProviders } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// GET all active insurance providers
router.get('/insurance-providers', async (req, res) => {
  try {
    const providers = await db.select()
      .from(insuranceProviders)
      .where(eq(insuranceProviders.isActive, true))
      .orderBy(insuranceProviders.sortOrder);
      
    res.json(providers);
  } catch (error) {
    console.error('Error fetching insurance providers:', error);
    res.status(500).json({ error: 'Failed to fetch insurance providers' });
  }
});

// GET a single insurance provider by ID
router.get('/insurance-providers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const [provider] = await db.select()
      .from(insuranceProviders)
      .where(eq(insuranceProviders.id, id));
      
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error('Error fetching insurance provider:', error);
    res.status(500).json({ error: 'Failed to fetch insurance provider' });
  }
});

// POST create a new insurance provider (admin only)
router.post('/insurance-providers', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
    
    const { name, description, logoUrl, websiteUrl, sortOrder, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const [newProvider] = await db.insert(insuranceProviders)
      .values({
        name,
        description,
        logoUrl,
        websiteUrl,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      })
      .returning();
      
    res.status(201).json(newProvider);
  } catch (error) {
    console.error('Error creating insurance provider:', error);
    res.status(500).json({ error: 'Failed to create insurance provider' });
  }
});

// PATCH update an insurance provider (admin only)
router.patch('/insurance-providers/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const { name, description, logoUrl, websiteUrl, sortOrder, isActive } = req.body;
    const updates: any = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;
    
    const [updatedProvider] = await db.update(insuranceProviders)
      .set(updates)
      .where(eq(insuranceProviders.id, id))
      .returning();
      
    if (!updatedProvider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(updatedProvider);
  } catch (error) {
    console.error('Error updating insurance provider:', error);
    res.status(500).json({ error: 'Failed to update insurance provider' });
  }
});

// DELETE an insurance provider (admin only)
router.delete('/insurance-providers/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    const [deletedProvider] = await db.delete(insuranceProviders)
      .where(eq(insuranceProviders.id, id))
      .returning();
      
    if (!deletedProvider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting insurance provider:', error);
    res.status(500).json({ error: 'Failed to delete insurance provider' });
  }
});

export default router;