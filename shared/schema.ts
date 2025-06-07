import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  recipient: text("recipient").notNull(),
  relationshipRole: text("relationship_role").notNull(),
  personality: text("personality").notNull(),
  quirks: text("quirks"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  originalMessageId: integer("original_message_id").references(() => messages.id),
  lemonSqueezyOrderId: text("lemon_squeezy_order_id"),
  status: text("status").default("pending").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const premiumMessages = pgTable("premium_messages", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  recipient: true,
  relationshipRole: true,
  personality: true,
  quirks: true,
  content: true,
  imageUrl: true,
  isPremium: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  email: true,
  originalMessageId: true,
  lemonSqueezyOrderId: true,
  status: true,
});

export const insertPremiumMessageSchema = createInsertSchema(premiumMessages).pick({
  purchaseId: true,
  content: true,
  orderIndex: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type PremiumMessage = typeof premiumMessages.$inferSelect;
export type InsertPremiumMessage = z.infer<typeof insertPremiumMessageSchema>;

// Request/Response types
export const generateMessageSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  relationshipRole: z.string().min(1, "Relationship role is required"),
  personality: z.string().min(1, "Personality description is required"),
  quirks: z.string().optional(),
  includeImage: z.boolean().default(false),
});

export const purchaseRequestSchema = z.object({
  email: z.string().email("Valid email is required"),
  messageId: z.number().int("Valid message ID is required"),
});

export type GenerateMessageRequest = z.infer<typeof generateMessageSchema>;
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
