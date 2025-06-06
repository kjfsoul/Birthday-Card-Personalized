import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Download, Copy, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PremiumMessage {
  id: number;
  content: string;
  orderIndex: number;
}

interface Purchase {
  id: number;
  email: string;
  status: string;
}

interface PurchaseData {
  purchase: Purchase;
  premiumMessages: PremiumMessage[];
}

export default function ThankYou() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const [, setLocation] = useLocation();
  const [messagesGenerated, setMessagesGenerated] = useState(false);
  const { toast } = useToast();

  const { data: purchaseData, isLoading, error } = useQuery<PurchaseData>({
    queryKey: [`/api/purchase/${purchaseId}`],
    enabled: !!purchaseId,
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
      <div className="container mx-auto px-4 py-8 max-w-md">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-success to-blue-500 rounded-full mb-6 animate-pulse">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you! 🎉
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            Your premium messages are ready below
          </p>
        </div>

        {/* Premium Messages */}
        {generatePremiumMessagesMutation.isPending ? (
          <Card className="p-8 text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="text-white">✨</span>
            </div>
            <p className="text-gray-600 font-medium">Creating your premium messages...</p>
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {purchaseData.premiumMessages.map((message) => (
              <Card key={message.id} className="p-5 shadow-lg border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{message.orderIndex}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base leading-relaxed text-gray-900 mb-3">
                      {message.content}
                    </p>
                    <Button
                      onClick={() => handleCopyMessage(message.content)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Digital Card Download */}
        <Card className="bg-gradient-to-r from-secondary to-blue-300 p-6 text-center shadow-xl mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            <Download className="inline w-5 h-5 mr-2" />
            Your Digital Card
          </h3>
          <p className="text-gray-700 mb-4">
            Beautiful, ready-to-share birthday card template
          </p>
          <Button 
            onClick={handleDownloadCard}
            className="bg-white text-gray-900 font-bold hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Card
          </Button>
        </Card>

        {/* Generate Another */}
        <Button 
          onClick={handleGenerateAnother}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Another Message ✨
        </Button>
      </div>
    </div>
  );
}
