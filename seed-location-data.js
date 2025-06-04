import { db } from './server/db.js';
import { staff, locationTreatments, treatments } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Starting to seed location data...');

  // Add staff members to locations
  // First, check if location 3 has any staff assigned
  const existingStaff = await db.select().from(staff).where(eq(staff.locationId, 3));
  console.log(`Location 3 has ${existingStaff.length} staff members.`);

  if (existingStaff.length === 0) {
    // Add staff members to location 3
    const staffData = [
      {
        name: "Dr. Sophia Martinez",
        title: "Clinical Director",
        bio: "Dr. Martinez specializes in family-based therapy for eating disorders. With over 15 years of experience, she has helped countless patients achieve lasting recovery.",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
        email: "smartinez@completeeatingcare.com",
        phone: "(312) 555-8765",
        locationId: 3,
        specialty: "Family-Based Therapy",
        isLeadership: false,
        sortOrder: 1
      },
      {
        name: "Dr. Michael Wong",
        title: "Psychiatrist",
        bio: "Dr. Wong oversees medication management and provides psychiatric care for our patients. He takes a holistic approach to treatment, focusing on both mind and body.",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        email: "mwong@completeeatingcare.com",
        phone: "(312) 555-3421",
        locationId: 3,
        specialty: "Psychiatric Care",
        isLeadership: false,
        sortOrder: 2
      },
      {
        name: "Sarah Johnson, LCSW",
        title: "Therapist",
        bio: "Sarah specializes in CBT and DBT approaches for treating eating disorders. She creates a supportive environment where patients can develop healthy coping skills.",
        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
        email: "sjohnson@completeeatingcare.com",
        phone: "(312) 555-9087",
        locationId: 3,
        specialty: "CBT/DBT",
        isLeadership: false,
        sortOrder: 3
      }
    ];

    for (const member of staffData) {
      await db.insert(staff).values(member);
      console.log(`Added ${member.name} to location 3`);
    }
  }

  // Associate treatments with location 3
  const existingTreatmentLinks = await db.select().from(locationTreatments).where(eq(locationTreatments.locationId, 3));
  console.log(`Location 3 has ${existingTreatmentLinks.length} treatments assigned.`);

  if (existingTreatmentLinks.length === 0) {
    // Get all treatments
    const allTreatments = await db.select().from(treatments);
    
    // Associate first 3 treatments with location 3
    for (let i = 0; i < Math.min(3, allTreatments.length); i++) {
      await db.insert(locationTreatments).values({
        locationId: 3,
        treatmentId: allTreatments[i].id
      });
      console.log(`Associated treatment ${allTreatments[i].name} with location 3`);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch(e => {
  console.error('Error during seeding:', e);
  process.exit(1);
});