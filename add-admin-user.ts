import { db } from './server/db';
import { users } from './shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  try {
    console.log("Starting admin user creation script");
    
    // Check if users table is empty
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log("Users table is empty. Adding admin user...");
      
      // Add admin user
      const hashedPassword = await hashPassword("admin123");
      
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword
      });
      
      console.log("Admin user created successfully");
      console.log("Username: admin");
      console.log("Password: admin123");
    } else {
      console.log(`Users table already has ${existingUsers.length} records. No action taken.`);
    }
    
  } catch (error) {
    console.error("Error in admin user creation script:", error);
  }
}

main();