import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  recipient: text("recipient").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  originalMessageId: integer("original_message_id").references(() => messages.id),
  lemonSqueezyOrderId: text("lemon_squeezy_order_id"),
  status: text("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const premiumMessages = pgTable("premium_messages", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  recipient: true,
  description: true,
  content: true,
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
  description: z.string().min(1, "Description is required"),
});

export const purchaseRequestSchema = z.object({
  email: z.string().email("Valid email is required"),
  messageId: z.number().int("Valid message ID is required"),
});

export type GenerateMessageRequest = z.infer<typeof generateMessageSchema>;
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
