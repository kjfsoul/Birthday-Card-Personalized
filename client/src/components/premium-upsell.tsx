import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Unlock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Checkout from "@/components/checkout";

interface PremiumUpsellProps {
  messageId: number;
  onBack: () => void;
}

export default function PremiumUpsell({ messageId, onBack }: PremiumUpsellProps) {
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createPurchaseMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/create-purchase", {
        email,
        messageId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // In a real implementation, redirect to Lemon Squeezy checkout
      // For demo purposes, we'll simulate successful purchase
      if (data.checkoutUrl) {
        // window.location.href = data.checkoutUrl;
        // For demo, redirect to thank you page
        setLocation(`/thank-you/${data.purchaseId}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    createPurchaseMutation.mutate(email);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-secondary to-yellow-400 rounded-full mb-4">
          <Unlock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Love it? There's more! 💝
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          Unlock premium features for the perfect birthday celebration
        </p>
      </div>

      {/* Features Card */}
      <Card className="p-6 shadow-xl border-gray-100">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">$2.99</div>
          <div className="text-gray-600">One-time purchase</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">5 additional premium messages</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">Beautiful downloadable card design</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">Instant delivery via email</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">Different emotional tones & styles</span>
          </div>
        </div>
      </Card>

      {/* Purchase Form */}
      <Card className="p-6 shadow-xl border-gray-100">
        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email address for delivery
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={createPurchaseMutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
          >
            {createPurchaseMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 mr-2" />
                Unlock Premium Messages 🚀
              </>
            )}
          </Button>

          <p className="text-xs text-gray-600 text-center">
            <Shield className="inline w-3 h-3 mr-1" />
            Secure payment via Lemon Squeezy
          </p>
        </form>
      </Card>

      {/* Back Button */}
      <Button 
        onClick={onBack}
        variant="ghost"
        className="w-full text-gray-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Message
      </Button>
    </div>
  );
}
