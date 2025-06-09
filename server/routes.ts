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
import Stripe from "stripe";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default_key"
});

// Initialize Stripe client
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate AI message endpoint
  app.post("/api/generate-message", async (req, res) => {
    try {
      const validatedData = generateMessageSchema.parse(req.body);
      const { recipientName, recipientEmail, recipientPhone, recipientGender, relationshipRole, personality, quirks, senderEmail, senderPhone, deliveryMethod } = validatedData;

      // Enhanced "Gennie" persona with humor and personality
      const currentYear = new Date().getFullYear();
      const systemPrompt = `You are Gennie, a witty and creative birthday message creator who crafts personalized, hilarious, and memorable birthday messages. Your messages are:
- Sharp, clever, and unexpectedly funny
- 2-3 sentences with perfect comedic timing
- Reference current trends, memes, or ${currentYear} culture when relevant
- Roast them lovingly while celebrating them
- Include their quirks and unique traits in clever ways
- Use emojis sparingly but effectively
- Feel like they were written by someone who truly knows them
- Balance humor with genuine affection

Create a birthday message that would make them laugh out loud and screenshot to share.`;

      const quirksText = quirks ? `\nTheir unique quirks: ${quirks}` : '';
      const genderText = recipientGender ? `\nGender: ${recipientGender}` : '';
      const userPrompt = `Create a hilarious yet heartfelt birthday message for: ${recipientName}
They are my: ${relationshipRole}
Their personality: ${personality}${quirksText}${genderText}

Make it funny, personal, and memorable - something they'd actually want to share!`;

      // Using gpt-4 model which is available in the user's plan
      const response = await openai.chat.completions.create({
        model: "gpt-4",
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

      // Generate sophisticated image incorporating personality and interests
      let imageUrl = null;
      try {
        let imagePrompt = `Create an elegant birthday celebration scene that reflects personality and interests. `;
        
        // Add personality-based visual elements
        const quirksLower = (quirks || '').toLowerCase();
        const personalityLower = personality.toLowerCase();
        
        if (quirksLower.includes('horse') || personalityLower.includes('horse') || quirksLower.includes('riding') || personalityLower.includes('equestrian')) {
          imagePrompt += `Include subtle horse-themed elements like horseshoes, riding boots, or equestrian motifs. `;
        }
        if (quirksLower.includes('cat') || personalityLower.includes('cat') || quirksLower.includes('feline')) {
          imagePrompt += `Include elegant cat silhouettes or paw prints. `;
        }
        if (quirksLower.includes('garden') || personalityLower.includes('garden') || quirksLower.includes('flower') || quirksLower.includes('plant')) {
          imagePrompt += `Include beautiful flowers and garden elements. `;
        }
        if (quirksLower.includes('music') || personalityLower.includes('music') || quirksLower.includes('sing') || quirksLower.includes('instrument')) {
          imagePrompt += `Include musical notes or instruments subtly. `;
        }
        if (quirksLower.includes('art') || personalityLower.includes('art') || quirksLower.includes('paint') || quirksLower.includes('draw')) {
          imagePrompt += `Include artistic brushes or paint palettes. `;
        }
        if (quirksLower.includes('coffee') || personalityLower.includes('coffee') || quirksLower.includes('cafe')) {
          imagePrompt += `Include elegant coffee cups or coffee beans. `;
        }
        if (quirksLower.includes('book') || personalityLower.includes('read') || quirksLower.includes('literature')) {
          imagePrompt += `Include vintage books or reading glasses. `;
        }
        if (quirksLower.includes('travel') || personalityLower.includes('travel') || quirksLower.includes('adventure')) {
          imagePrompt += `Include subtle travel elements like vintage luggage or maps. `;
        }
        
        imagePrompt += `Style: Clean, sophisticated, minimalist design with soft pastels and gold accents. Include birthday candles, gentle balloons, or elegant confetti. Professional photography quality, high resolution. The image should contain ONLY the text "Happy Birthday, ${recipientName}!" prominently displayed. No other text should appear in the image.`;

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        imageUrl = imageResponse.data?.[0]?.url || null;
      } catch (error) {
        console.error("Image generation failed:", error);
        // Continue without image if generation fails
      }

      // Store the generated message
      const message = await storage.createMessage({
        recipientName,
        recipientEmail: recipientEmail || null,
        recipientPhone: recipientPhone || null,
        recipientGender: recipientGender || null,
        relationshipRole,
        personality,
        quirks: quirks || null,
        content: messageContent,
        imageUrl,
        senderEmail,
        senderPhone: senderPhone || null,
        deliveryMethod,
        isPremium: false,
      });

      res.json({ 
        id: message.id,
        content: messageContent,
        imageUrl: imageUrl 
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

      const quirksText = originalMessage.quirks ? `\nTheir unique quirks: ${originalMessage.quirks}` : '';
      const userPrompt = `Create 5 premium birthday messages for: ${originalMessage.recipientName}
They are my: ${originalMessage.relationshipRole}
Their personality: ${originalMessage.personality}${quirksText}

Make each message unique with different comedic styles and emotional tones!`;

      // Using gpt-4 model which is available in the user's plan
      const response = await openai.chat.completions.create({
        model: "gpt-4",
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

  // Stripe payment intent endpoint
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          type: "premium_messages"
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
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

      res.json({ 
        purchaseId: purchase.id,
        status: "pending"
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

  // Generate card image endpoint for card designer
  app.post("/api/generate-card-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      res.json({
        imageUrl: imageResponse.data[0].url,
      });
    } catch (error: any) {
      console.error("Error generating card image:", error);
      res.status(500).json({ 
        message: "Error generating card image", 
        error: error.message 
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
