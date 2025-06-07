import { 
  messages, 
  purchases, 
  premiumMessages,
  type Message, 
  type InsertMessage,
  type Purchase,
  type InsertPurchase,
  type PremiumMessage,
  type InsertPremiumMessage
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | undefined>;
  
  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchaseByOrderId(orderId: string): Promise<Purchase | undefined>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
  
  // Premium message operations
  createPremiumMessages(messages: InsertPremiumMessage[]): Promise<PremiumMessage[]>;
  getPremiumMessagesByPurchase(purchaseId: number): Promise<PremiumMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async getPurchaseByOrderId(orderId: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.lemonSqueezyOrderId, orderId));
    return purchase || undefined;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .update(purchases)
      .set({ status })
      .where(eq(purchases.id, id))
      .returning();
    return purchase || undefined;
  }

  async createPremiumMessages(insertMessages: InsertPremiumMessage[]): Promise<PremiumMessage[]> {
    const created = await db
      .insert(premiumMessages)
      .values(insertMessages)
      .returning();
    return created;
  }

  async getPremiumMessagesByPurchase(purchaseId: number): Promise<PremiumMessage[]> {
    const messages = await db
      .select()
      .from(premiumMessages)
      .where(eq(premiumMessages.purchaseId, purchaseId))
      .orderBy(premiumMessages.orderIndex);
    return messages;
  }
}

export const storage = new DatabaseStorage();
