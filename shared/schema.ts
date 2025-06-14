import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  recipientGender: text("recipient_gender"),
  relationshipRole: text("relationship_role").notNull(),
  personality: text("personality").notNull(),
  quirks: text("quirks"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  senderEmail: text("sender_email").notNull(),
  senderPhone: text("sender_phone"),
  deliveryMethod: text("delivery_method").notNull(), // email, sms, both
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
  recipientName: true,
  recipientEmail: true,
  recipientPhone: true,
  recipientGender: true,
  relationshipRole: true,
  personality: true,
  quirks: true,
  content: true,
  imageUrl: true,
  senderEmail: true,
  senderPhone: true,
  deliveryMethod: true,
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
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  recipientPhone: z.string().optional(),
  recipientGender: z.string().optional(),
  relationshipRole: z.string().min(1, "Relationship is required"),
  personality: z.string().min(1, "Personality is required"),
  quirks: z.string().optional(),
  senderEmail: z.string().email("Valid email required"),
  senderPhone: z.string().optional(),
  deliveryMethod: z.enum(["email", "sms", "both"]),
});

export const purchaseRequestSchema = z.object({
  email: z.string().email("Valid email is required"),
  messageId: z.number().int("Valid message ID is required"),
});

export type GenerateMessageRequest = z.infer<typeof generateMessageSchema>;
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;

export const SendCardRequestSchema = z.object({
  messageId: z.number().int(),
  recipientEmail: z.string().email(),
});
export type SendCardRequest = z.infer<typeof SendCardRequestSchema>;

export const SendSmsCardRequestSchema = z.object({
  messageId: z.number().int(),
  recipientPhone: z.string().min(10), // Basic validation for phone number length
});
export type SendSmsCardRequest = z.infer<typeof SendSmsCardRequestSchema>;
