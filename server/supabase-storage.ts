import { supabase, type Database } from './supabase';

type Message = Database['public']['Tables']['messages']['Row'];
type InsertMessage = Database['public']['Tables']['messages']['Insert'];
type Purchase = Database['public']['Tables']['purchases']['Row'];
type InsertPurchase = Database['public']['Tables']['purchases']['Insert'];
type PremiumMessage = Database['public']['Tables']['premium_messages']['Row'];
type InsertPremiumMessage = Database['public']['Tables']['premium_messages']['Insert'];
type CardDesign = Database['public']['Tables']['card_designs']['Row'];
type InsertCardDesign = Database['public']['Tables']['card_designs']['Insert'];

export interface ISupabaseStorage {
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | undefined>;
  
  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
  
  // Premium message operations
  createPremiumMessages(messages: InsertPremiumMessage[]): Promise<PremiumMessage[]>;
  getPremiumMessagesByPurchase(purchaseId: number): Promise<PremiumMessage[]>;
  
  // Card design operations
  saveCardDesign(design: InsertCardDesign): Promise<CardDesign>;
  getCardDesign(messageId: number): Promise<CardDesign | undefined>;
}

export class SupabaseStorage implements ISupabaseStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(insertMessage)
      .select()
      .single();

    if (error) {`-/*////////////////////`
      throw new Error(`Failed to create message: ${error.message}`);
    }
    
    return data;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows found
      throw new Error(`Failed to get message: ${error.message}`);
    }
    
    return data;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const { data, error } = await supabase
      .from('purchases')
      .insert(insertPurchase)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create purchase: ${error.message}`);
    }
    
    return data;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows found
      throw new Error(`Failed to get purchase: ${error.message}`);
    }
    
    return data;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const { data, error } = await supabase
      .from('purchases')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update purchase status: ${error.message}`);
    }
    
    return data;
  }

  async createPremiumMessages(insertMessages: InsertPremiumMessage[]): Promise<PremiumMessage[]> {
    const { data, error } = await supabase
      .from('premium_messages')
      .insert(insertMessages)
      .select();

    if (error) {
      throw new Error(`Failed to create premium messages: ${error.message}`);
    }
    
    return data;
  }

  async getPremiumMessagesByPurchase(purchaseId: number): Promise<PremiumMessage[]> {
    const { data, error } = await supabase
      .from('premium_messages')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('order_index');

    if (error) {
      throw new Error(`Failed to get premium messages: ${error.message}`);
    }
    
    return data;
  }

  async saveCardDesign(design: InsertCardDesign): Promise<CardDesign> {
    const { data, error } = await supabase
      .from('card_designs')
      .insert(design)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save card design: ${error.message}`);
    }
    
    return data;
  }

  async getCardDesign(messageId: number): Promise<CardDesign | undefined> {
    const { data, error } = await supabase
      .from('card_designs')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows found
      throw new Error(`Failed to get card design: ${error.message}`);
    }
    
    return data;
  }
}

export const storage = new SupabaseStorage();