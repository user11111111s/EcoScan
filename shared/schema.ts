import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sustainability metrics schema
export const metricsSchema = z.object({
  materials: z.number().min(0).max(100),
  carbonFootprint: z.number().min(0).max(100),
  recyclability: z.number().min(0).max(100),
});

export type Metrics = z.infer<typeof metricsSchema>;

// Environmental impact schema
export const impactSchema = z.object({
  co2: z.string(),
  water: z.string(),
  packaging: z.string(),
  land: z.string(),
});

export type Impact = z.infer<typeof impactSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  barcode: z.string(),
  ecoScore: z.string(),
  metrics: metricsSchema,
  impact: impactSchema,
  ingredients: z.string(),
  certifications: z.array(z.object({
    name: z.string(),
    color: z.string()
  })),
  production: z.string(),
  packaging_details: z.string(),
});

export type Product = z.infer<typeof productSchema>;

// Insert product schema
export const insertProductSchema = productSchema.omit({ id: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;

// Favorite product schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id"),
  productData: jsonb("product_data").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  productId: true,
  productData: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Search history schema
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  userId: true,
  query: true,
  createdAt: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Alternative product schema
export const alternativeSchema = z.object({
  id: z.number(),
  name: z.string(),
  ecoScore: z.string(),
  feature: z.string(),
});

export type Alternative = z.infer<typeof alternativeSchema>;
