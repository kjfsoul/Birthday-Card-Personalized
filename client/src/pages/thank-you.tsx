import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Download, Copy, Plus, Palette, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CardDesigner from "@/components/card-designer";

interface PremiumMessage {
  id: number;
  content: string;
  orderIndex: number;
}

interface Purchase {
  id: number;
  email: string;
  status: string;
  originalMessageId?: number;
}

interface PurchaseData {
  purchase: Purchase;
  premiumMessages: PremiumMessage[];
}

interface OriginalMessage {
  id: number;
  content: string;
  imageUrl?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string; // Added recipientPhone
  relationshipRole: string;
}

export default function ThankYou() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  
  // Extract purchaseId from query parameters
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const purchaseId = searchParams.get('purchase');
  const [messagesGenerated, setMessagesGenerated] = useState(false);
  const { toast } = useToast();

  const { data: purchaseData, isLoading, error } = useQuery<PurchaseData>({
    queryKey: [`/api/purchase/${purchaseId}`],
    enabled: !!purchaseId,
  });

  // Get original message for card design
  const { data: originalMessage } = useQuery<OriginalMessage>({
    queryKey: [`/api/messages/${purchaseData?.purchase?.originalMessageId}`],
    enabled: !!purchaseData?.purchase?.originalMessageId,
  });

  const generatePremiumMessagesMutation = useMutation({
    mutationFn: async ({ messageId, purchaseId }: { messageId: number; purchaseId: number }) => {
      const response = await apiRequest("POST", "/api/generate-premium-messages", {
        messageId,
        purchaseId,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessagesGenerated(true);
      // Refetch purchase data to get the new premium messages
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error generating premium messages",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // Generate premium messages if they don't exist yet
    if (purchaseData && purchaseData.premiumMessages.length === 0 && !messagesGenerated && purchaseData.purchase.originalMessageId) {
      generatePremiumMessagesMutation.mutate({
        messageId: purchaseData.purchase.originalMessageId,
        purchaseId: parseInt(purchaseId || "0"),
      });
    }
  }, [purchaseData, messagesGenerated, purchaseId]);

  const handleSaveCard = (cardData: any) => {
    toast({
      title: "Card Saved",
      description: "Your custom card design has been saved!"
    });
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCard = () => {
    // In a real implementation, this would download from Supabase Storage
    toast({
      title: "Download started",
      description: "Your beautiful digital card is downloading! 🎨✨",
    });
  };

  const handleGenerateAnother = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading your premium messages...</p>
        </div>
      </div>
    );
  }

  if (error || !purchaseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your purchase. Please check your email for the correct link.
          </p>
          <Button onClick={handleGenerateAnother}>
            Go Back Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6 animate-pulse">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Thank you for your purchase!
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            Your premium birthday experience is ready
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8"> {/* Responsive TabsList */}
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Premium Messages
            </TabsTrigger>
            <TabsTrigger value="card-designer" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Card Designer
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Physical Gifts
            </TabsTrigger>
          </TabsList>

          {/* Premium Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            {generatePremiumMessagesMutation.isPending ? (
              <Card className="p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <span className="text-white">✨</span>
                </div>
                <p className="text-gray-600 font-medium">Creating your premium messages...</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchaseData.premiumMessages.map((message) => (
                  <Card key={message.id} className="p-6 shadow-lg border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{message.orderIndex}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base leading-relaxed text-gray-900 mb-4">
                          {message.content}
                        </p>
                        <Button
                          onClick={() => handleCopyMessage(message.content)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Message
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Card Designer Tab */}
          <TabsContent value="card-designer" className="transition-all duration-500 ease-out opacity-0 scale-95 data-[state=active]:opacity-100 data-[state=active]:scale-100">
            {originalMessage ? (
              <CardDesigner
                messageId={originalMessage.id} // Added messageId
                messageContent={originalMessage.content}
                originalImageUrl={originalMessage.imageUrl}
                recipientName={originalMessage.recipientName}
                recipientEmail={originalMessage.recipientEmail}
                recipientPhone={originalMessage.recipientPhone} // Added recipientPhone
                relationshipRole={originalMessage.relationshipRole}
                onSave={handleSaveCard}
              />
            ) : (
              <Card className="p-8 text-center">
                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Card Designer Loading</h3>
                <p className="text-gray-600">Preparing your card customization tools...</p>
              </Card>
            )}
          </TabsContent>

          {/* Physical Gifts Tab */}
          <TabsContent value="gifts" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Turn Your Card Into Physical Gifts</h3>
              <p className="text-gray-600 text-lg">Premium Printify integration with zodiac symbols and custom designs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👕</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Custom T-Shirts</h4>
                <p className="text-sm text-gray-600 mb-4">Zodiac-themed apparel with your personalized message</p>
                <Button variant="outline" className="w-full">
                  Design Shirt
                </Button>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">☕</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Photo Mugs</h4>
                <p className="text-sm text-gray-600 mb-4">Custom mugs with your birthday image and message</p>
                <Button variant="outline" className="w-full">
                  Design Mug
                </Button>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Zodiac Apparel</h4>
                <p className="text-sm text-gray-600 mb-4">Astrological symbols with personalized touches</p>
                <Button variant="outline" className="w-full">
                  Browse Zodiac
                </Button>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Custom Gifts</h4>
                <p className="text-sm text-gray-600 mb-4">Canvas prints, phone cases, and more</p>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">Coming Soon: Printify Integration</h4>
              <p className="text-gray-700">
                We're partnering with Printify to bring you high-quality physical products. 
                Your card designs will soon be available on premium apparel, mugs, and gift items 
                with zodiac symbols and astrological themes.
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-12">
          <Button 
            onClick={handleGenerateAnother}
            className="bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Another Card
          </Button>
        </div>
      </div>
    </div>
  );
}
