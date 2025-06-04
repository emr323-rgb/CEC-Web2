import { Router, Request, Response } from 'express';
import { db } from '../db';
import { eq, and, desc, asc, or, SQL } from 'drizzle-orm';
import { locations, staff, treatments, testimonials, locationTreatments, siteContent } from '../../shared/schema';
import { log } from '../vite';

const router = Router();

// Location Routes
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const allLocations = await db.select().from(locations);
    res.json(allLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Failed to fetch locations' });
  }
});

router.get('/locations/featured', async (req: Request, res: Response) => {
  try {
    const featuredLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.featuredOnHomepage, true));
    
    // If no featured locations, return first 3
    if (featuredLocations.length === 0) {
      const someLocations = await db
        .select()
        .from(locations)
        .limit(3);
      return res.json(someLocations);
    }
    
    res.json(featuredLocations);
  } catch (error) {
    console.error('Error fetching featured locations:', error);
    res.status(500).json({ message: 'Failed to fetch featured locations' });
  }
});

router.get('/locations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);
    
    // Get the location
    const location = await db
      .select()
      .from(locations)
      .where(eq(locations.id, locationId))
      .then(rows => rows[0]);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Get staff for this location
    const locationStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.locationId, locationId))
      .orderBy(asc(staff.sortOrder));
    
    // Get treatments for this location
    const locationTreatmentLinks = await db
      .select()
      .from(locationTreatments)
      .where(eq(locationTreatments.locationId, locationId));
    
    const treatmentIds = locationTreatmentLinks.map(link => link.treatmentId);
    
    let locationTreatmentsData = [];
    if (treatmentIds.length > 0) {
      locationTreatmentsData = await db
        .select()
        .from(treatments)
        .where(
          treatmentIds.map(id => eq(treatments.id, id)).reduce((acc, condition) => 
            acc ? or(acc, condition) : condition
          )
        );
    }
    
    // Get testimonials for this location
    const locationTestimonials = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.locationId, locationId));
    
    // Combine data
    const locationWithDetails = {
      ...location,
      staff: locationStaff,
      treatments: locationTreatmentsData,
      testimonials: locationTestimonials
    };
    
    res.json(locationWithDetails);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Failed to fetch location details' });
  }
});

router.post('/locations', async (req: Request, res: Response) => {
  try {
    const locationData = req.body;
    
    const [newLocation] = await db
      .insert(locations)
      .values(locationData)
      .returning();
    
    res.status(201).json(newLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Failed to create location' });
  }
});

router.put('/locations/:id', async (req: Request, res: Response) => {
  try {
    console.log('PUT /locations/:id - Request method:', req.method);
    console.log('PUT /locations/:id - Request headers:', req.headers);
    console.log('PUT /locations/:id - Request body:', req.body);
    
    const { id } = req.params;
    const locationId = parseInt(id);
    const locationData = req.body;
    
    console.log(`Attempting to update location ${locationId} with data:`, locationData);
    
    const [updatedLocation] = await db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, locationId))
      .returning();
    
    if (!updatedLocation) {
      console.log(`Location ${locationId} not found`);
      return res.status(404).json({ message: 'Location not found' });
    }
    
    console.log('Location updated successfully:', updatedLocation);
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

router.patch('/locations/:id', async (req: Request, res: Response) => {
  try {
    console.log('PATCH /locations/:id - Request method:', req.method);
    console.log('PATCH /locations/:id - Request headers:', req.headers);
    console.log('PATCH /locations/:id - Request body:', req.body);
    
    const { id } = req.params;
    const locationId = parseInt(id);
    const locationData = req.body;
    
    console.log(`Attempting to update location ${locationId} with data:`, locationData);
    
    const [updatedLocation] = await db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, locationId))
      .returning();
    
    if (!updatedLocation) {
      console.log(`Location ${locationId} not found`);
      return res.status(404).json({ message: 'Location not found' });
    }
    
    console.log('Location updated successfully via PATCH:', updatedLocation);
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location via PATCH:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

router.delete('/locations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);
    
    // First check if location exists
    const location = await db
      .select()
      .from(locations)
      .where(eq(locations.id, locationId))
      .then(rows => rows[0]);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Delete related records first to maintain referential integrity
    // Delete location-treatment links
    await db
      .delete(locationTreatments)
      .where(eq(locationTreatments.locationId, locationId));
    
    // Delete testimonials
    await db
      .delete(testimonials)
      .where(eq(testimonials.locationId, locationId));
    
    // Reassign staff to another location or delete them?
    // For now, we'll delete them, but you might want to modify this behavior
    await db
      .delete(staff)
      .where(eq(staff.locationId, locationId));
    
    // Now delete the location
    await db
      .delete(locations)
      .where(eq(locations.id, locationId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Failed to delete location' });
  }
});

// Staff Routes
router.get('/staff', async (req: Request, res: Response) => {
  try {
    const allStaff = await db
      .select()
      .from(staff)
      .orderBy(asc(staff.sortOrder));
    
    res.json(allStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

router.get('/staff/leadership', async (req: Request, res: Response) => {
  try {
    // Only get leadership staff 
    const leadershipStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.isLeadership, true))
      .orderBy(asc(staff.sortOrder));
    
    // Log for debugging
    console.log(`Returning ${leadershipStaff.length} leadership staff members`);
    
    res.json(leadershipStaff);
  } catch (error) {
    console.error('Error fetching leadership staff:', error);
    res.status(500).json({ message: 'Failed to fetch leadership staff' });
  }
});

router.get('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);
    
    const staffMember = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .then(rows => rows[0]);
    
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    // Get the location for this staff member
    const location = await db
      .select()
      .from(locations)
      .where(eq(locations.id, staffMember.locationId))
      .then(rows => rows[0]);
    
    const staffWithLocation = {
      ...staffMember,
      location
    };
    
    res.json(staffWithLocation);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ message: 'Failed to fetch staff details' });
  }
});

router.post('/staff', async (req: Request, res: Response) => {
  try {
    const staffData = req.body;
    
    // Ensure locationId is null if isLeadership is true
    if (staffData.isLeadership === true) {
      staffData.locationId = null;
    }
    
    console.log('Creating staff member with data:', staffData);
    
    const [newStaff] = await db
      .insert(staff)
      .values(staffData)
      .returning();
    
    console.log('Staff created successfully:', newStaff);
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ message: 'Failed to create staff member', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);
    const staffData = req.body;
    
    // Ensure locationId is null if isLeadership is true
    if (staffData.isLeadership === true) {
      staffData.locationId = null;
    }
    
    console.log('PUT staff/:id received:', staffId, staffData);
    
    const [updatedStaff] = await db
      .update(staff)
      .set(staffData)
      .where(eq(staff.id, staffId))
      .returning();
    
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    console.log('Staff updated successfully:', updatedStaff);
    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ 
      message: 'Failed to update staff member', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Add PATCH endpoint for staff - same as PUT but for partial updates
router.patch('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);
    const staffData = req.body;
    
    // Ensure locationId is null if isLeadership is true
    if (staffData.isLeadership === true) {
      staffData.locationId = null;
    }
    
    console.log('PATCH staff/:id received:', staffId, staffData);
    
    const [updatedStaff] = await db
      .update(staff)
      .set(staffData)
      .where(eq(staff.id, staffId))
      .returning();
    
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    console.log('Staff updated successfully:', updatedStaff);
    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ 
      message: 'Failed to update staff member', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

router.delete('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);
    
    // Check if staff exists
    const staffMember = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .then(rows => rows[0]);
    
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    // Delete the staff member
    await db
      .delete(staff)
      .where(eq(staff.id, staffId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
});

// Treatment Routes
router.get('/treatments', async (req: Request, res: Response) => {
  try {
    const allTreatments = await db.select().from(treatments);
    res.json(allTreatments);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ message: 'Failed to fetch treatments' });
  }
});

router.get('/treatments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const treatmentId = parseInt(id);
    
    const treatment = await db
      .select()
      .from(treatments)
      .where(eq(treatments.id, treatmentId))
      .then(rows => rows[0]);
    
    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }
    
    // Get locations that offer this treatment
    const locationLinks = await db
      .select()
      .from(locationTreatments)
      .where(eq(locationTreatments.treatmentId, treatmentId));
    
    const locationIds = locationLinks.map(link => link.locationId);
    
    let treatmentLocations = [];
    if (locationIds.length > 0) {
      treatmentLocations = await db
        .select()
        .from(locations)
        .where(
          locationIds.map(id => eq(locations.id, id)).reduce((acc, condition) => 
            acc ? or(acc, condition) : condition
          )
        );
    }
    
    // Get testimonials for this treatment
    const treatmentTestimonials = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.treatmentId, treatmentId));
    
    const treatmentWithDetails = {
      ...treatment,
      locations: treatmentLocations,
      testimonials: treatmentTestimonials
    };
    
    res.json(treatmentWithDetails);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({ message: 'Failed to fetch treatment details' });
  }
});

router.post('/treatments', async (req: Request, res: Response) => {
  try {
    const treatmentData = req.body;
    
    const [newTreatment] = await db
      .insert(treatments)
      .values(treatmentData)
      .returning();
    
    res.status(201).json(newTreatment);
  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({ message: 'Failed to create treatment' });
  }
});

router.put('/treatments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const treatmentId = parseInt(id);
    const treatmentData = req.body;
    
    const [updatedTreatment] = await db
      .update(treatments)
      .set(treatmentData)
      .where(eq(treatments.id, treatmentId))
      .returning();
    
    if (!updatedTreatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }
    
    res.json(updatedTreatment);
  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({ message: 'Failed to update treatment' });
  }
});

router.delete('/treatments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const treatmentId = parseInt(id);
    
    // Check if treatment exists
    const treatment = await db
      .select()
      .from(treatments)
      .where(eq(treatments.id, treatmentId))
      .then(rows => rows[0]);
    
    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }
    
    // Delete location-treatment links
    await db
      .delete(locationTreatments)
      .where(eq(locationTreatments.treatmentId, treatmentId));
    
    // Update testimonials to remove treatment association
    await db
      .update(testimonials)
      .set({ treatmentId: null })
      .where(eq(testimonials.treatmentId, treatmentId));
    
    // Delete the treatment
    await db
      .delete(treatments)
      .where(eq(treatments.id, treatmentId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({ message: 'Failed to delete treatment' });
  }
});

// Location-Treatment Association Routes
router.post('/locations/:locationId/treatments/:treatmentId', async (req: Request, res: Response) => {
  try {
    const { locationId, treatmentId } = req.params;
    const locId = parseInt(locationId);
    const treatId = parseInt(treatmentId);
    
    // Check if location and treatment exist
    const location = await db
      .select()
      .from(locations)
      .where(eq(locations.id, locId))
      .then(rows => rows[0]);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    const treatment = await db
      .select()
      .from(treatments)
      .where(eq(treatments.id, treatId))
      .then(rows => rows[0]);
    
    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }
    
    // Check if association already exists
    const existingAssociation = await db
      .select()
      .from(locationTreatments)
      .where(
        and(
          eq(locationTreatments.locationId, locId),
          eq(locationTreatments.treatmentId, treatId)
        )
      )
      .then(rows => rows[0]);
    
    if (existingAssociation) {
      return res.status(409).json({ message: 'Association already exists' });
    }
    
    // Create the association
    const [newAssociation] = await db
      .insert(locationTreatments)
      .values({
        locationId: locId,
        treatmentId: treatId
      })
      .returning();
    
    res.status(201).json(newAssociation);
  } catch (error) {
    console.error('Error associating location with treatment:', error);
    res.status(500).json({ message: 'Failed to associate location with treatment' });
  }
});

router.delete('/locations/:locationId/treatments/:treatmentId', async (req: Request, res: Response) => {
  try {
    const { locationId, treatmentId } = req.params;
    const locId = parseInt(locationId);
    const treatId = parseInt(treatmentId);
    
    // Check if association exists
    const existingAssociation = await db
      .select()
      .from(locationTreatments)
      .where(
        and(
          eq(locationTreatments.locationId, locId),
          eq(locationTreatments.treatmentId, treatId)
        )
      )
      .then(rows => rows[0]);
    
    if (!existingAssociation) {
      return res.status(404).json({ message: 'Association not found' });
    }
    
    // Delete the association
    await db
      .delete(locationTreatments)
      .where(
        and(
          eq(locationTreatments.locationId, locId),
          eq(locationTreatments.treatmentId, treatId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing treatment from location:', error);
    res.status(500).json({ message: 'Failed to remove treatment from location' });
  }
});

// Testimonial Routes
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const allTestimonials = await db.select().from(testimonials);
    res.json(allTestimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

router.get('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testimonialId = parseInt(id);
    
    const testimonial = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, testimonialId))
      .then(rows => rows[0]);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    let testimonialWithDetails: any = { ...testimonial };
    
    // Get location if applicable
    if (testimonial.locationId) {
      const location = await db
        .select()
        .from(locations)
        .where(eq(locations.id, testimonial.locationId))
        .then(rows => rows[0]);
      
      testimonialWithDetails.location = location;
    }
    
    // Get treatment if applicable
    if (testimonial.treatmentId) {
      const treatment = await db
        .select()
        .from(treatments)
        .where(eq(treatments.id, testimonial.treatmentId))
        .then(rows => rows[0]);
      
      testimonialWithDetails.treatment = treatment;
    }
    
    res.json(testimonialWithDetails);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ message: 'Failed to fetch testimonial details' });
  }
});

router.post('/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonialData = req.body;
    
    const [newTestimonial] = await db
      .insert(testimonials)
      .values(testimonialData)
      .returning();
    
    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testimonialId = parseInt(id);
    const testimonialData = req.body;
    
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set(testimonialData)
      .where(eq(testimonials.id, testimonialId))
      .returning();
    
    if (!updatedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testimonialId = parseInt(id);
    
    // Check if testimonial exists
    const testimonial = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, testimonialId))
      .then(rows => rows[0]);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    // Delete the testimonial
    await db
      .delete(testimonials)
      .where(eq(testimonials.id, testimonialId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
});

// Site Content Routes
router.get('/content', async (req: Request, res: Response) => {
  try {
    const { section } = req.query;
    
    if (section) {
      const contentItems = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, section as string));
      
      res.json(contentItems);
    } else {
      const allContent = await db.select().from(siteContent);
      res.json(allContent);
    }
  } catch (error) {
    console.error('Error fetching site content:', error);
    res.status(500).json({ message: 'Failed to fetch site content' });
  }
});

// Get site content by section with a dedicated endpoint
router.get('/content/by-section/:section', async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    
    const contentItems = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.section, section));
    
    res.json(contentItems);
  } catch (error) {
    console.error('Error fetching site content by section:', error);
    res.status(500).json({ message: 'Failed to fetch site content' });
  }
});

router.get('/content/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const content = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, key))
      .then(rows => rows[0]);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content by key:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

router.post('/content', async (req: Request, res: Response) => {
  try {
    const contentData = req.body;
    
    // Check if content with this key already exists
    const existingContent = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, contentData.key))
      .then(rows => rows[0]);
    
    if (existingContent) {
      return res.status(409).json({ message: 'Content with this key already exists' });
    }
    
    const [newContent] = await db
      .insert(siteContent)
      .values({
        ...contentData,
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating site content:', error);
    res.status(500).json({ message: 'Failed to create content' });
  }
});

router.put('/content/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);
    const contentData = req.body;
    
    const [updatedContent] = await db
      .update(siteContent)
      .set({
        ...contentData,
        updatedAt: new Date()
      })
      .where(eq(siteContent.id, contentId))
      .returning();
    
    if (!updatedContent) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating site content:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
});

router.patch('/content/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);
    const contentData = req.body;
    
    // Find content by ID
    const content = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.id, contentId))
      .then(rows => rows[0]);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Update existing content
    const [updatedContent] = await db
      .update(siteContent)
      .set({
        ...contentData,
        updatedAt: new Date()
      })
      .where(eq(siteContent.id, contentId))
      .returning();
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating site content by id:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
});

router.patch('/content/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const contentData = req.body;
    
    // Find content by key
    const content = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, key))
      .then(rows => rows[0]);
    
    if (!content) {
      // If content doesn't exist, create it
      const [newContent] = await db
        .insert(siteContent)
        .values({
          key,
          title: contentData.title || key,
          content: contentData.content || '',
          section: contentData.section || 'general',
          updatedAt: new Date()
        })
        .returning();
      
      return res.status(201).json(newContent);
    }
    
    // Update existing content
    const [updatedContent] = await db
      .update(siteContent)
      .set({
        ...contentData,
        updatedAt: new Date()
      })
      .where(eq(siteContent.key, key))
      .returning();
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating site content by key:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
});

router.delete('/content/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);
    
    // Check if content exists
    const content = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.id, contentId))
      .then(rows => rows[0]);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Delete the content
    await db.delete(siteContent).where(eq(siteContent.id, contentId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting site content:', error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

export default router;