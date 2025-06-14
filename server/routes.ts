import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./supabase-storage";
import { 
  generateMessageSchema, 
  purchaseRequestSchema,
  type GenerateMessageRequest,
  type PurchaseRequest,
  SendCardRequestSchema,
  type SendCardRequest,
  SendSmsCardRequestSchema,
  type SendSmsCardRequest
} from "@shared/schema";
import Stripe from "stripe";
import { Resend } from 'resend';
import twilio from 'twilio';

// Dynamic OpenAI import to handle module compatibility
const createOpenAIClient = async () => {
  const openaiModule = await import("openai");
  const OpenAIClass = openaiModule.default || openaiModule.OpenAI || openaiModule;
  return new OpenAIClass({ 
    apiKey: process.env.OPENAI_API_KEY || "sk-default_key"
  });
};

let openaiClient: any = null;

// Initialize Stripe client
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Expected environment variables:
// OPENAI_API_KEY: OpenAI API key
// STABILITY_API_KEY: Stability API key (Note: This seems to be from a previous version, DALL-E is used now)
// STRIPE_SECRET_KEY: Stripe API key
// RESEND_API_KEY: Resend API key
// TWILIO_ACCOUNT_SID: Twilio Account SID
// TWILIO_AUTH_TOKEN: Twilio Auth Token
// TWILIO_PHONE_NUMBER: Twilio Phone Number

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
- Your tone subtly shifts based on the relationship – e.g., more playful for friends, respectful yet warm for a boss, deeply affectionate for family.
- Don't just mention quirks; weave them into the fabric of the message in a surprising and delightful way.

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
        // Determine display name - use actual name unless it's a family relationship
        const familyRelations = ['mom', 'mother', 'dad', 'father', 'grandmother', 'grandma', 'grandfather', 'grandpa', 'sister', 'brother', 'aunt', 'uncle'];
        const isFamily = familyRelations.some(relation => relationshipRole.toLowerCase().includes(relation));
        const displayName = isFamily ? relationshipRole : recipientName;

        // Enhanced prompt engineering focusing on verbs and nouns
        let imagePrompt = `Create a sophisticated birthday celebration image for my ${relationshipRole}, ${displayName}. The overall mood of the image should be fitting for celebrating my ${relationshipRole}. Image featuring: `;
        
        // Extract key nouns and verbs from personality and quirks
        const allText = `${personality} ${quirks || ''}`.toLowerCase();
        const quirksLower = (quirks || '').toLowerCase();
        const personalityLower = personality.toLowerCase();
        
        let primaryThemeSet = false;
        // Specific imagery based on interests (nouns and verbs)
        if (quirksLower.includes('horse') || quirksLower.includes('riding') || quirksLower.includes('equestrian') || quirksLower.includes('rider')) {
          imagePrompt += `A rustic western-style birthday scene with horseshoes as decorative elements, cowboy boots as vases holding wildflowers, and a vintage saddle as backdrop. Western color palette with earth tones, leather textures, and rope details. `;
          primaryThemeSet = true;
        } else if (quirksLower.includes('trailer') || quirksLower.includes('country') || quirksLower.includes('rustic')) {
          imagePrompt += `A charming country-style birthday setup with mason jar centerpieces, burlap and lace decorations, wooden accents, and wildflower arrangements. Rustic farmhouse aesthetic. `;
          primaryThemeSet = true;
        } else if (allText.includes('cat') || allText.includes('feline')) {
          imagePrompt += `An elegant birthday scene with subtle cat-themed elements like paw print confetti, whisker-shaped candles, and sophisticated feline silhouettes. `;
          primaryThemeSet = true;
        }

        // Attempt to combine themes if no strong primary theme is set
        let secondaryTheme = "";
        if (!primaryThemeSet) {
          if (allText.includes('garden') || allText.includes('flower') || allText.includes('plant')) {
            secondaryTheme = `Elements of a botanical celebration with lush garden flowers, potted plants, floral arrangements, and natural greenery. `;
          } else if (allText.includes('music') || allText.includes('sing') || allText.includes('instrument')) {
            secondaryTheme = `Musical-themed elements like vintage instruments, sheet music decorations, or musical note confetti. `;
          } else if (allText.includes('art') || allText.includes('paint') || allText.includes('creative')) {
            secondaryTheme = `Artistic touches with paint palettes, brushes, colorful splatters, or creative studio elements. `;
          } else if (allText.includes('coffee') || allText.includes('cafe')) {
            secondaryTheme = `Cozy coffee-themed accents like vintage coffee cups, coffee beans, or cafe-style decorations. `;
          } else if (allText.includes('book') || allText.includes('read') || allText.includes('literature')) {
            secondaryTheme = `Literary-inspired details such as vintage books, reading glasses, or bookshelf backgrounds. `;
          }
        }

        if (primaryThemeSet && secondaryTheme) {
            // If a primary theme was set and a secondary could also apply, integrate it subtly.
            // This is a simple approach; more complex logic could be added.
            imagePrompt += `Subtly integrate: ${secondaryTheme.replace("Elements of a ", "").replace("Musical-themed e", "e").replace("Artistic t", "t").replace("Cozy coffee-themed a", "a").replace("Literary-inspired d", "d")} `;
        } else if (secondaryTheme) {
            imagePrompt += secondaryTheme;
        } else if (!primaryThemeSet) {
             imagePrompt += `A classic elegant birthday celebration with sophisticated decorations, fine details, and tasteful color coordination. `;
        }
        
        // Personality-based styling
        let styleApplied = false;
        if (personalityLower.includes('funny') || personalityLower.includes('humorous')) {
          imagePrompt += `Add playful, whimsical elements and bright, cheerful colors. `;
          styleApplied = true;
        }
        if (personalityLower.includes('competitive') || personalityLower.includes('passionate')) {
          imagePrompt += `Include bold, energetic color schemes with dynamic compositions. `;
          styleApplied = true;
        }
        if (personalityLower.includes('stubborn') || personalityLower.includes('strong')) {
          imagePrompt += `Use strong, confident design elements with bold contrasts. `;
          styleApplied = true;
        }

        // Default vibrancy for casual relationships if no other style was applied
        const casualRelations = ['friend', 'colleague', 'classmate', 'teammate'];
        if (!styleApplied && casualRelations.some(relation => relationshipRole.toLowerCase().includes(relation))) {
            imagePrompt += `Make it vibrant and eye-catching. `;
        }


        // Final styling without problematic text
        imagePrompt += `Professional photography style, high resolution, clean composition, soft lighting, birthday candles, and celebration elements. No text or words in the image. Focus on visual storytelling through objects and themes.`;

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
        recipient_name: recipientName,
        recipient_email: recipientEmail || null,
        recipient_phone: recipientPhone || null,
        recipient_gender: recipientGender || null,
        relationship_role: relationshipRole,
        personality,
        quirks: quirks || null,
        content: messageContent,
        image_url: imageUrl,
        sender_email: senderEmail,
        sender_phone: senderPhone || null,
        delivery_method: deliveryMethod,
        is_premium: false,
      });

      res.json({ 
        id: message.id,
        content: messageContent,
        imageUrl: message.image_url 
      });

    } catch (error) {
      console.error("Message generation failed:", error);
      res.status(500).json({ 
        message: "Failed to generate message. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Send SMS card endpoint
  app.post("/api/send-sms-card", async (req, res) => {
    try {
      const validatedData = SendSmsCardRequestSchema.parse(req.body);
      const { messageId, recipientPhone } = validatedData;

      const message = await storage.getMessage(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      const { content, imageUrl, recipientName } = message; // recipientPhone from message is not used, per instruction

      let smsBody = `Happy Birthday, ${recipientName}!\n${content}`;
      if (imageUrl) {
        smsBody += `\nView your card: ${imageUrl}`;
      }

      await twilioClient.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipientPhone, // Use recipientPhone from the request body
      });

      return res.json({ success: true, message: "SMS sent successfully." });
    } catch (error) {
      console.error("Send SMS card failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      if (error instanceof require('zod').ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      // Consider more specific error handling for Twilio errors if needed
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Send card endpoint
  app.post("/api/send-card", async (req, res) => {
    try {
      const validatedData = SendCardRequestSchema.parse(req.body);
      const { messageId, recipientEmail } = validatedData;

      const message = await storage.getMessage(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      const { content, imageUrl, recipientName } = message;

      let htmlBody = `<p>Hi ${recipientName},</p><p>${content}</p>`;
      if (imageUrl) {
        htmlBody += `<img src="${imageUrl}" alt="Birthday image" style="max-width: 100%; height: auto;" />`;
      }

      const { data, error } = await resend.emails.send({
        from: 'BirthdayGen <noreply@yourdomain.com>', // Replace with your verified domain
        to: recipientEmail,
        subject: `Happy Birthday, ${recipientName}!`,
        html: htmlBody,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, data });
    } catch (error) {
      console.error("Send card failed:", error);
      // Check if err is an instance of Error before accessing its message property
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      if (error instanceof require('zod').ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      return res.status(500).json({ error: errorMessage });
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
- Reference the recipient's characteristics (using their relationshipRole, personality, and quirks for each message)
- Have different tones (heartfelt, funny, inspirational, warm, celebratory)
- Feel personal and authentic
- Consider these angles for different messages: a purely funny one, a genuinely sweet one, one that references a shared memory (even if hypothetical, based on their personality), one that's a bit quirky, and one that's celebratory and grand.

Return only the messages, numbered 1-5.`;

      const quirksText = originalMessage.quirks ? `\nTheir unique quirks: ${originalMessage.quirks}` : '';
      const userPrompt = `Create 5 premium birthday messages for: ${originalMessage.recipientName}
They are my: ${originalMessage.relationshipRole}
Their personality: ${originalMessage.personality}${quirksText}

Make each message unique with different comedic styles and emotional tones, ensuring each leverages their specific characteristics!`;

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
        purchase_id: purchaseId,
        content,
        order_index: index + 1,
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

  // Get individual message for card designer
  app.get("/api/messages/:id", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json({
        id: message.id,
        content: message.content,
        imageUrl: message.imageUrl,
        recipientName: message.recipientName,
        recipientEmail: message.recipientEmail,
        recipientPhone: message.recipientPhone, // Added recipientPhone
        relationshipRole: message.relationshipRole
      });

    } catch (error) {
      console.error("Failed to get message:", error);
      res.status(500).json({ 
        message: "Failed to retrieve message details",
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
        imageUrl: imageResponse.data?.[0]?.url || "",
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
