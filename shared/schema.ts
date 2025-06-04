import { pgTable, text, serial, integer, boolean, numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

// Complete Eating Care - Schema

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  description: text("description"),
  openingHours: text("opening_hours"),
  imageUrl: text("image_url"),
  featuredOnHomepage: boolean("featured_on_homepage").default(false),
  sortOrder: integer("sort_order").default(0),
  tagline: text("tagline").default("Leading Eating Disorder Treatment")
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  email: text("email"),
  phone: text("phone"),
  locationId: integer("location_id"),
  specialty: text("specialty"),
  isLeadership: boolean("is_leadership").default(false),
  sortOrder: integer("sort_order").default(0)
});

export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url")
});

export const locationTreatments = pgTable("location_treatments", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  treatmentId: integer("treatment_id").notNull()
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  locationId: integer("location_id"),
  treatmentId: integer("treatment_id"),
  isApproved: boolean("is_approved").default(true)
});

// Site content table for editable static content
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  section: text("section").notNull(),
  videoUrl: text("video_url"),
  embeddedVideoId: text("embedded_video_id"),
  videoPlatform: text("video_platform").default('youtube'),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Legacy tables - kept for backward compatibility
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  phone: text("phone"),
  openTime: text("open_time"),
  closeTime: text("close_time")
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  categoryId: integer("category_id").notNull(),
  storeId: integer("store_id").notNull(),
  regularPrice: numeric("regular_price").notNull(),
  salePrice: numeric("sale_price").notNull(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  size: text("size"),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const productPrices = pgTable("product_prices", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  storeId: integer("store_id").notNull(),
  price: numeric("price").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const spreadsheetImports = pgTable("spreadsheet_imports", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  weekOf: timestamp("week_of").notNull(),
  importedAt: timestamp("imported_at").defaultNow(),
  processedItems: integer("processed_items").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending")
});

// Insert Schemas for Complete Eating Care
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
}).extend({
  // Make locationId truly optional, can be null for leadership staff
  locationId: z.number().nullable().optional()
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
});

export const insertLocationTreatmentSchema = createInsertSchema(locationTreatments).omit({
  id: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
}).extend({
  isApproved: z.boolean().default(true)
});

export const insertSiteContentSchema = createInsertSchema(siteContent).omit({
  id: true,
  updatedAt: true,
});

// Legacy Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  location: true,
  phone: true,
  openTime: true,
  closeTime: true
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertProductPriceSchema = createInsertSchema(productPrices).omit({
  id: true,
  updatedAt: true,
});

export const insertSpreadsheetImportSchema = createInsertSchema(spreadsheetImports).omit({
  id: true,
  importedAt: true,
}).extend({
  status: z.string().default("pending"),
  processedItems: z.number().default(0)
});

// Types for Complete Eating Care
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Treatment = typeof treatments.$inferSelect;

export type InsertLocationTreatment = z.infer<typeof insertLocationTreatmentSchema>;
export type LocationTreatment = typeof locationTreatments.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

// Extended types for Complete Eating Care
export type StaffWithLocation = Staff & {
  location: Location;
};

export type LocationWithTreatments = Location & {
  treatments: Treatment[];
};

export type LocationWithStaff = Location & {
  staff: Staff[];
};

export type LocationWithDetails = Location & {
  treatments: Treatment[];
  staff: Staff[];
  testimonials: Testimonial[];
};

// Legacy Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertProductPrice = z.infer<typeof insertProductPriceSchema>;
export type ProductPrice = typeof productPrices.$inferSelect;

export type InsertSpreadsheetImport = z.infer<typeof insertSpreadsheetImportSchema>;
export type SpreadsheetImport = typeof spreadsheetImports.$inferSelect;

// Insurance providers - For carousel
export const insuranceProviders = pgTable("insurance_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true)
});

export const insertInsuranceProviderSchema = createInsertSchema(insuranceProviders)
  .omit({ id: true });

export type InsertInsuranceProvider = z.infer<typeof insertInsuranceProviderSchema>;
export type InsuranceProvider = typeof insuranceProviders.$inferSelect;

// Extended types for frontend
export type SaleWithDetails = Sale & {
  store: Store;
  category: Category;
  savingsAmount: number;
  savingsPercent: number;
};

export type StoreWithStats = Store & {
  currentSales: number;
  averageDiscount: number;
};

export type ProductWithDetails = Product & {
  category: Category;
  averagePrice: number;
};

export type ProductPriceWithDetails = ProductPrice & {
  store: Store;
  product: Product;
};

export type SaleWithComparison = SaleWithDetails & {
  marketAveragePrice: number;
  marketSavingsPercent: number;
};
