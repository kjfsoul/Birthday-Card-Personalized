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

export class MemStorage implements IStorage {
  private messages: Map<number, Message>;
  private purchases: Map<number, Purchase>;
  private premiumMessages: Map<number, PremiumMessage>;
  private messageId: number;
  private purchaseId: number;
  private premiumMessageId: number;

  constructor() {
    this.messages = new Map();
    this.purchases = new Map();
    this.premiumMessages = new Map();
    this.messageId = 1;
    this.purchaseId = 1;
    this.premiumMessageId = 1;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.purchaseId++;
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchaseByOrderId(orderId: string): Promise<Purchase | undefined> {
    return Array.from(this.purchases.values()).find(
      (purchase) => purchase.lemonSqueezyOrderId === orderId
    );
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (purchase) {
      const updatedPurchase = { ...purchase, status };
      this.purchases.set(id, updatedPurchase);
      return updatedPurchase;
    }
    return undefined;
  }

  async createPremiumMessages(insertMessages: InsertPremiumMessage[]): Promise<PremiumMessage[]> {
    const created: PremiumMessage[] = [];
    
    for (const insertMessage of insertMessages) {
      const id = this.premiumMessageId++;
      const message: PremiumMessage = {
        ...insertMessage,
        id,
      };
      this.premiumMessages.set(id, message);
      created.push(message);
    }
    
    return created;
  }

  async getPremiumMessagesByPurchase(purchaseId: number): Promise<PremiumMessage[]> {
    return Array.from(this.premiumMessages.values())
      .filter((message) => message.purchaseId === purchaseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
}

export const storage = new MemStorage();
