import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateMessageSchema, 
  purchaseRequestSchema,
  type GenerateMessageRequest,
  type PurchaseRequest 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate AI message endpoint
  app.post("/api/generate-message", async (req, res) => {
    try {
      const validatedData = generateMessageSchema.parse(req.body);
      const { recipientName, recipientEmail, recipientPhone, recipientGender, relationshipRole, personality, quirks, senderEmail, senderPhone, deliveryMethod } = validatedData;

      // Generate message with OpenAI
      let messageContent = "";
      let imageUrl = "";

      try {
        // Dynamic import to handle OpenAI module compatibility  
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY
        });

        const systemPrompt = `You are a witty, creative birthday message writer who specializes in personalized, humorous messages that feel authentic and heartfelt. Create a birthday message that would make them laugh out loud and screenshot to share.`;

        const quirksText = quirks ? `\nTheir unique quirks: ${quirks}` : '';
        const genderText = recipientGender ? `\nGender: ${recipientGender}` : '';
        const userPrompt = `Create a hilarious yet heartfelt birthday message for: ${recipientName}
They are my: ${relationshipRole}
Their personality: ${personality}${quirksText}${genderText}

Make it funny, personal, and memorable!`;

        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.9,
        });

        messageContent = response.choices[0].message.content || "Happy Birthday! Hope your day is amazing!";

        // Generate image with personality-based prompting
        const imagePrompt = `Birthday celebration scene for a ${personality} person${quirks ? ` who loves ${quirks}` : ''}. Western themes for horse riders, artistic elements for artists, cozy themes for homebodies. Warm, festive, no text or words.`;

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });

        imageUrl = imageResponse.data?.[0]?.url || "";
      } catch (error) {
        console.error("OpenAI API error:", error);
        messageContent = `Happy Birthday ${recipientName}! 🎉 Hope your special day is filled with joy, laughter, and all your favorite things. You're absolutely wonderful and deserve the best celebration!`;
      }

      // Save message to database
      const savedMessage = await storage.createMessage({
        recipientName,
        recipientEmail,
        recipientPhone,
        recipientGender,
        relationshipRole,
        personality,
        quirks,
        content: messageContent,
        imageUrl,
        senderEmail,
        senderPhone,
        deliveryMethod,
        isPremium: false
      });

      res.json({
        id: savedMessage.id,
        content: messageContent,
        imageUrl
      });

    } catch (error: any) {
      console.error("Message generation failed:", error);
      res.status(500).json({ message: "Failed to generate message: " + error.message });
    }
  });

  // Test purchase endpoint for premium access
  app.post("/api/test-purchase", async (req, res) => {
    try {
      const { email, messageId } = req.body;

      // Create test purchase
      const purchase = await storage.createPurchase({
        email,
        originalMessageId: messageId,
        status: "completed"
      });

      // Generate premium messages
      const premiumMessages = [
        "🎉 Here's an extra special birthday wish just for you!",
        "✨ Another heartfelt message to make your day even brighter!",
        "🎂 One more birthday surprise coming your way!"
      ].map((content, index) => ({
        purchaseId: purchase.id,
        content,
        orderIndex: index + 1
      }));

      await storage.createPremiumMessages(premiumMessages);

      res.json({
        purchaseId: purchase.id,
        status: "completed"
      });

    } catch (error: any) {
      console.error("Test purchase failed:", error);
      res.status(500).json({ message: "Failed to create test purchase: " + error.message });
    }
  });

  // Get purchase details endpoint
  app.get("/api/purchase/:id", async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      const purchase = await storage.getPurchase(purchaseId);
      
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      const premiumMessages = await storage.getPremiumMessagesByPurchase(purchaseId);
      
      let originalMessage = null;
      if (purchase.originalMessageId) {
        originalMessage = await storage.getMessage(purchase.originalMessageId);
      }

      res.json({
        purchase: {
          id: purchase.id,
          email: purchase.email,
          status: purchase.status,
          originalMessageId: purchase.originalMessageId
        },
        premiumMessages: premiumMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          orderIndex: msg.orderIndex
        })),
        originalMessage: originalMessage ? {
          id: originalMessage.id,
          content: originalMessage.content,
          imageUrl: originalMessage.imageUrl,
          recipientName: originalMessage.recipientName,
          relationshipRole: originalMessage.relationshipRole
        } : null
      });

    } catch (error: any) {
      console.error("Failed to get purchase:", error);
      res.status(500).json({ message: "Failed to get purchase details: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}