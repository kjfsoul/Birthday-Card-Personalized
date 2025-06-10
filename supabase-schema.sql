-- Supabase SQL Schema for Birthday Gen
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_gender TEXT,
  relationship_role TEXT NOT NULL,
  personality TEXT NOT NULL,
  quirks TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'both')),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  original_message_id INTEGER REFERENCES messages(id),
  stripe_checkout_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium messages table
CREATE TABLE premium_messages (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id) NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card designs table (for saving custom card designs)
CREATE TABLE card_designs (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id),
  font_family TEXT DEFAULT 'font-serif',
  font_size INTEGER DEFAULT 24,
  text_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  custom_text TEXT,
  sparkle_effects JSONB,
  custom_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_messages_sender_email ON messages(sender_email);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_premium_messages_purchase_id ON premium_messages(purchase_id);

-- Row Level Security (RLS) policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_designs ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your authentication setup)
-- For now, allowing all operations - you can restrict based on user authentication

CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on purchases" ON purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations on premium_messages" ON premium_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on card_designs" ON card_designs FOR ALL USING (true);