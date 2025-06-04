import { db } from './server/db';
import { staff, locations } from './shared/schema';

async function main() {
  try {
    console.log("Starting staff population script");
    
    // Check if staff table is empty
    const existingStaff = await db.select().from(staff);
    
    if (existingStaff.length === 0) {
      console.log("Staff table is empty. Adding sample staff...");
      
      // Get location IDs
      const locationsList = await db.select({ id: locations.id }).from(locations);
      const locationIds = locationsList.map(loc => loc.id);
      
      if (locationIds.length === 0) {
        console.log("Error: No locations found. Please add locations first.");
        process.exit(1);
      }
      
      console.log(`Found ${locationIds.length} locations.`);
      
      // Sample staff for the first location
      if (locationIds.length > 0) {
        console.log(`Adding staff for location ID ${locationIds[0]}`);
        await db.insert(staff).values([
          {
            name: "Dr. Jennifer Reynolds",
            title: "Medical Director",
            bio: "Dr. Reynolds has over 15 years of experience treating eating disorders and leads our medical team with compassion and expertise. She is board-certified in psychiatry and has specialized training in eating disorder treatment.",
            imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
            email: "jreynolds@completeeatingcare.com",
            phone: "(212) 555-1000",
            locationId: locationIds[0],
            specialty: "Medical Psychiatry",
            isLeadership: true,
            sortOrder: 1
          },
          {
            name: "Dr. Michael Chen",
            title: "Clinical Director",
            bio: "Dr. Chen oversees our clinical programs and brings a wealth of knowledge in evidence-based treatment approaches. He specializes in cognitive-behavioral therapy and family-based treatment for eating disorders.",
            imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
            email: "mchen@completeeatingcare.com",
            phone: "(212) 555-1001",
            locationId: locationIds[0],
            specialty: "Clinical Psychology",
            isLeadership: true,
            sortOrder: 2
          },
          {
            name: "Sarah Johnson, RD",
            title: "Lead Nutritionist",
            bio: "Sarah is a registered dietitian with specialized training in nutrition therapy for eating disorders. She helps patients develop a healthy relationship with food and supports them through the nutrition rehabilitation process.",
            imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1887&auto=format&fit=crop",
            email: "sjohnson@completeeatingcare.com",
            phone: "(212) 555-1002",
            locationId: locationIds[0],
            specialty: "Nutrition Therapy",
            isLeadership: true,
            sortOrder: 3
          },
          {
            name: "Rebecca Williams, LCSW",
            title: "Therapist",
            bio: "Rebecca is a licensed clinical social worker specializing in the treatment of eating disorders. She provides individual and group therapy with a focus on helping patients develop healthy coping skills.",
            imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
            email: "rwilliams@completeeatingcare.com",
            phone: "(212) 555-1003",
            locationId: locationIds[0],
            specialty: "Individual and Group Therapy",
            isLeadership: false,
            sortOrder: 4
          }
        ]);
      }
      
      // Sample staff for the second location
      if (locationIds.length > 1) {
        console.log(`Adding staff for location ID ${locationIds[1]}`);
        await db.insert(staff).values([
          {
            name: "Dr. Amanda Torres",
            title: "Medical Director",
            bio: "Dr. Torres leads our Boston medical team with dedication and expertise. She specializes in adolescent medicine and has extensive experience treating eating disorders in young patients.",
            imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d22?q=80&w=2069&auto=format&fit=crop",
            email: "atorres@completeeatingcare.com",
            phone: "(617) 555-2000",
            locationId: locationIds[1],
            specialty: "Adolescent Medicine",
            isLeadership: true,
            sortOrder: 1
          },
          {
            name: "Dr. James Wilson",
            title: "Clinical Psychologist",
            bio: "Dr. Wilson specializes in cognitive-behavioral therapy and dialectical behavior therapy for eating disorders. He brings a compassionate and evidence-based approach to his work with patients.",
            imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop",
            email: "jwilson@completeeatingcare.com",
            phone: "(617) 555-2001",
            locationId: locationIds[1],
            specialty: "CBT and DBT",
            isLeadership: false,
            sortOrder: 2
          },
          {
            name: "Emily Parker, RD",
            title: "Nutritionist",
            bio: "Emily is a registered dietitian who specializes in helping patients develop a balanced relationship with food. She provides individualized nutrition counseling and meal planning support.",
            imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=2070&auto=format&fit=crop",
            email: "eparker@completeeatingcare.com",
            phone: "(617) 555-2002",
            locationId: locationIds[1],
            specialty: "Nutrition Therapy",
            isLeadership: false,
            sortOrder: 3
          }
        ]);
      }
      
      // Sample staff for the third location
      if (locationIds.length > 2) {
        console.log(`Adding staff for location ID ${locationIds[2]}`);
        await db.insert(staff).values([
          {
            name: "Dr. Robert Kim",
            title: "Clinical Director",
            bio: "Dr. Kim oversees our Chicago clinical programs and specializes in family-based treatment for eating disorders. He is dedicated to providing compassionate care and evidence-based treatment.",
            imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop",
            email: "rkim@completeeatingcare.com",
            phone: "(312) 555-3000",
            locationId: locationIds[2],
            specialty: "Family-Based Treatment",
            isLeadership: true,
            sortOrder: 1
          },
          {
            name: "Lisa Martinez, LMFT",
            title: "Family Therapist",
            bio: "Lisa is a licensed marriage and family therapist who specializes in working with families affected by eating disorders. She helps families develop communication skills and support strategies.",
            imageUrl: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?q=80&w=1974&auto=format&fit=crop",
            email: "lmartinez@completeeatingcare.com",
            phone: "(312) 555-3001",
            locationId: locationIds[2],
            specialty: "Family Therapy",
            isLeadership: false,
            sortOrder: 2
          }
        ]);
      }
      
      console.log("Staff population completed successfully");
    } else {
      console.log(`Staff table already has ${existingStaff.length} records. No action taken.`);
    }
    
  } catch (error) {
    console.error("Error in staff population script:", error);
  }
}

main();