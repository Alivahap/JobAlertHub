import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  professions: jsonb("professions").$type<string[]>().default([]),
  isAdmin: boolean("is_admin").default(false),
  emailNotifications: boolean("email_notifications").default(false),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  profession: text("profession").notNull(),
  institution: text("institution").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  url: text("url"),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  keys: jsonb("keys").$type<{ p256dh: string; auth: string }>().notNull(),
});

export const professions = pgTable("professions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertProfessionSchema = createInsertSchema(professions).omit({ id: true });
export type Profession = typeof professions.$inferSelect;
export type InsertProfession = z.infer<typeof insertProfessionSchema>;

export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  email: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  professions: z.array(z.string()).optional().default([]),
  isAdmin: z.boolean().optional().default(false),
  emailNotifications: z.boolean().optional().default(false),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, date: true }).extend({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const insertSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, userId: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertSubscriptionSchema>;

export const professionsList = [];

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("Kitap"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
