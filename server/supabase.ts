import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: number;
          recipient_name: string;
          recipient_email: string | null;
          recipient_phone: string | null;
          recipient_gender: string | null;
          relationship_role: string;
          personality: string;
          quirks: string | null;
          content: string;
          image_url: string | null;
          sender_email: string;
          sender_phone: string | null;
          delivery_method: 'email' | 'sms' | 'both';
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          recipient_name: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          recipient_gender?: string | null;
          relationship_role: string;
          personality: string;
          quirks?: string | null;
          content: string;
          image_url?: string | null;
          sender_email: string;
          sender_phone?: string | null;
          delivery_method: 'email' | 'sms' | 'both';
          is_premium?: boolean;
        };
      };
      purchases: {
        Row: {
          id: number;
          email: string;
          original_message_id: number | null;
          stripe_checkout_session_id: string | null;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          email: string;
          original_message_id?: number | null;
          stripe_checkout_session_id?: string | null;
          status?: 'pending' | 'completed' | 'failed';
        };
      };
      premium_messages: {
        Row: {
          id: number;
          purchase_id: number;
          content: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          purchase_id: number;
          content: string;
          order_index: number;
        };
      };
      card_designs: {
        Row: {
          id: number;
          message_id: number | null;
          font_family: string;
          font_size: number;
          text_color: string;
          background_color: string;
          custom_text: string | null;
          sparkle_effects: any;
          custom_image_url: string | null;
          created_at: string;
        };
        Insert: {
          message_id?: number | null;
          font_family?: string;
          font_size?: number;
          text_color?: string;
          background_color?: string;
          custom_text?: string | null;
          sparkle_effects?: any;
          custom_image_url?: string | null;
        };
      };
    };
  };
};