import { apiRequest } from "./queryClient";

export interface GenerateMessageRequest {
  recipient: string;
  description: string;
}

export interface GenerateMessageResponse {
  id: number;
  content: string;
}

export interface PurchaseRequest {
  email: string;
  messageId: number;
}

export interface PurchaseResponse {
  purchaseId: number;
  checkoutUrl: string;
  status: string;
}

export interface PremiumMessage {
  id: number;
  content: string;
  orderIndex: number;
}

export interface PurchaseDetails {
  purchase: {
    id: number;
    email: string;
    status: string;
    originalMessageId: number;
  };
  premiumMessages: PremiumMessage[];
}

export const api = {
  // Generate a free birthday message
  generateMessage: async (data: GenerateMessageRequest): Promise<GenerateMessageResponse> => {
    const response = await apiRequest("POST", "/api/generate-message", data);
    return response.json();
  },

  // Create a purchase record and get checkout URL
  createPurchase: async (data: PurchaseRequest): Promise<PurchaseResponse> => {
    const response = await apiRequest("POST", "/api/create-purchase", data);
    return response.json();
  },

  // Generate premium messages for a purchase
  generatePremiumMessages: async (messageId: number, purchaseId: number) => {
    const response = await apiRequest("POST", "/api/generate-premium-messages", {
      messageId,
      purchaseId,
    });
    return response.json();
  },

  // Get purchase details with premium messages
  getPurchaseDetails: async (purchaseId: number): Promise<PurchaseDetails> => {
    const response = await apiRequest("GET", `/api/purchase/${purchaseId}`);
    return response.json();
  },
};
