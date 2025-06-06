import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateMessageSchema, 
  purchaseRequestSchema,
  type GenerateMessageRequest,
  type PurchaseRequest 
} from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate AI message endpoint
  app.post("/api/generate-message", async (req, res) => {
    try {
      const validatedData = generateMessageSchema.parse(req.body);
      const { recipient, description } = validatedData;

      // Create the "Gennie" persona prompt for birthday messages
      const systemPrompt = `You are Gennie, an expert birthday message creator who crafts personalized, heartfelt, and joyful birthday messages. Your messages are:
- Warm, personal, and celebratory
- 2-3 sentences long
- Include relevant emojis naturally
- Reference the recipient's characteristics when provided
- Always upbeat and positive
- Feel authentic, not generic

Create a unique birthday message for the person described.`;

      const userPrompt = `Create a birthday message for: ${recipient}
Their characteristics: ${description}

Make it personal, joyful, and celebratory!`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.9,
      });

      const messageContent = response.choices[0].message.content;
      
      if (!messageContent) {
        throw new Error("Failed to generate message content");
      }

      // Store the generated message
      const message = await storage.createMessage({
        recipient,
        description,
        content: messageContent,
        isPremium: false,
      });

      res.json({ 
        id: message.id,
        content: messageContent 
      });

    } catch (error) {
      console.error("Message generation failed:", error);
      res.status(500).json({ 
        message: "Failed to generate message. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate premium messages for purchase
  app.post("/api/generate-premium-messages", async (req, res) => {
    try {
      const { messageId, purchaseId } = req.body;
      
      if (!messageId || !purchaseId) {
        return res.status(400).json({ message: "Message ID and Purchase ID are required" });
      }

      const originalMessage = await storage.getMessage(messageId);
      if (!originalMessage) {
        return res.status(404).json({ message: "Original message not found" });
      }

      const systemPrompt = `You are Gennie, an expert birthday message creator. Create 5 different premium birthday messages for the same person. Each message should:
- Be unique and different from the others
- Be 2-3 sentences long
- Include relevant emojis naturally
- Reference the recipient's characteristics
- Have different tones (heartfelt, funny, inspirational, warm, celebratory)
- Feel personal and authentic

Return only the messages, numbered 1-5.`;

      const userPrompt = `Create 5 premium birthday messages for: ${originalMessage.recipient}
Their characteristics: ${originalMessage.description}

Make each message unique with different emotional tones!`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.9,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to generate premium messages");
      }

      // Parse the numbered messages
      const messageLines = content.split('\n').filter(line => line.trim());
      const premiumMessageContents = messageLines
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);

      if (premiumMessageContents.length < 5) {
        // Fallback if parsing fails
        const fallbackMessages = content.split(/\d+\./).filter(msg => msg.trim()).slice(0, 5);
        premiumMessageContents.push(...fallbackMessages.map(msg => msg.trim()));
      }

      // Store premium messages
      const premiumMessagesToCreate = premiumMessageContents.slice(0, 5).map((content, index) => ({
        purchaseId,
        content,
        orderIndex: index + 1,
      }));

      const premiumMessages = await storage.createPremiumMessages(premiumMessagesToCreate);

      res.json({ 
        messages: premiumMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          orderIndex: msg.orderIndex
        }))
      });

    } catch (error) {
      console.error("Premium message generation failed:", error);
      res.status(500).json({ 
        message: "Failed to generate premium messages. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create purchase record
  app.post("/api/create-purchase", async (req, res) => {
    try {
      const validatedData = purchaseRequestSchema.parse(req.body);
      const { email, messageId } = validatedData;

      const purchase = await storage.createPurchase({
        email,
        originalMessageId: messageId,
        lemonSqueezyOrderId: null,
        status: "pending",
      });

      // In a real implementation, you would redirect to Lemon Squeezy checkout here
      // For now, we'll simulate a successful purchase
      const updatedPurchase = await storage.updatePurchaseStatus(purchase.id, "completed");

      res.json({ 
        purchaseId: purchase.id,
        checkoutUrl: `https://checkout.lemonsqueezy.com/buy/product-id?checkout[email]=${encodeURIComponent(email)}&checkout[custom][purchase_id]=${purchase.id}`,
        status: updatedPurchase?.status || "pending"
      });

    } catch (error) {
      console.error("Purchase creation failed:", error);
      res.status(500).json({ 
        message: "Failed to create purchase. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get purchase details with premium messages
  app.get("/api/purchase/:id", async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      
      if (isNaN(purchaseId)) {
        return res.status(400).json({ message: "Invalid purchase ID" });
      }

      const purchase = await storage.getPurchase(purchaseId);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      const premiumMessages = await storage.getPremiumMessagesByPurchase(purchaseId);

      res.json({
        purchase,
        premiumMessages: premiumMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          orderIndex: msg.orderIndex
        }))
      });

    } catch (error) {
      console.error("Failed to get purchase:", error);
      res.status(500).json({ 
        message: "Failed to retrieve purchase details",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Webhook endpoint for Lemon Squeezy (for real implementation)
  app.post("/api/webhook/lemon-squeezy", async (req, res) => {
    try {
      // In a real implementation, you would verify the webhook signature here
      const { custom_data, status } = req.body;
      
      if (custom_data?.purchase_id && status === "paid") {
        await storage.updatePurchaseStatus(custom_data.purchase_id, "completed");
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook processing failed:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
